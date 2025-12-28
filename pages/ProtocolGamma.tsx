
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- AUDIO HELPERS ---
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        let s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
}

const AI_VOICES = [
    { name: 'Zephyr', label: 'Zephyr (Gentle)', desc: 'Warm and empathetic' },
    { name: 'Puck', label: 'Puck (Neutral)', desc: 'Clear and informative' },
    { name: 'Charon', label: 'Charon (Deep)', desc: 'Authoritative and wise' },
    { name: 'Kore', label: 'Kore (Calm)', desc: 'Soothing and professional' },
    { name: 'Fenrir', label: 'Fenrir (Intense)', desc: 'Energetic and bold' },
];

export const ProtocolGamma: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [activeSpeaker, setActiveSpeaker] = useState<'user' | 'ai' | 'none'>('none');
    const [selectedVoice, setSelectedVoice] = useState('Zephyr');
    const [isScriptMode, setIsScriptMode] = useState(false);
    const [scriptLines, setScriptLines] = useState<{speaker: string, text: string}[]>([
        { speaker: 'You', text: "Start the rehearsal by introducing our new AI initiative." },
        { speaker: 'AI', text: "Welcome everyone. Today, we're looking at a paradigm shift in social media operations." },
        { speaker: 'You', text: "Focus on the autonomous agents part." },
        { speaker: 'AI', text: "Exactly. The core of Elevate OS is the seamless synergy between human strategy and autonomous execution." }
    ]);

    // Live API Refs
    const sessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const cleanup = () => {
        if (sessionRef.current) {
            try { sessionRef.current.close(); } catch(e) {}
            sessionRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
            audioStreamRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        sourcesRef.current.forEach(src => { try { src.stop(); } catch(e) {} });
        sourcesRef.current.clear();
        setIsConnected(false);
        setActiveSpeaker('none');
    };

    useEffect(() => {
        return () => cleanup();
    }, []);

    const handleConnect = async () => {
        if (isConnected) {
            cleanup();
            return;
        }

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API Key Missing");

            const ai = new GoogleGenAI({ apiKey });
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        if (!inputAudioContextRef.current || !audioStreamRef.current) return;
                        sourceRef.current = inputAudioContextRef.current.createMediaStreamSource(audioStreamRef.current);
                        processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        processorRef.current.onaudioprocess = (e) => {
                            if (isMuted) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            let sum = 0;
                            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                            const rms = Math.sqrt(sum / inputData.length);
                            if (rms > 0.02) setActiveSpeaker('user');
                            else if (activeSpeaker === 'user') setActiveSpeaker('none');

                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => {
                                sessionRef.current = session;
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        sourceRef.current.connect(processorRef.current);
                        processorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            setActiveSpeaker('ai');
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.onended = () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setActiveSpeaker('none');
                            };
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(src => { try { src.stop(); } catch(e) {} });
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setActiveSpeaker('none');
                        }
                    },
                    onclose: () => cleanup(),
                    onerror: () => cleanup()
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
                    systemInstruction: `You are a professional social media rehearsal partner. You help the user practice their scripts, announcements, and presentations. Respond as a supportive and critical colleague in your assigned voice: ${selectedVoice}.`
                }
            });
        } catch (e) {
            console.error("Connection failed", e);
            cleanup();
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in no-select">
            {/* HUD: Rehearsal Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex justify-between items-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-500 ${
                        isConnected ? 'bg-pink-500/20 border border-pink-500/30 text-pink-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                        <i className={`fa-solid ${isConnected ? 'fa-ear-listen' : 'fa-microphone-slash'}`}></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Protocol Gamma</h2>
                        <p className="text-[10px] font-mono text-pink-400 tracking-widest uppercase flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
                            Status: {isConnected ? 'Synchronized' : 'Standby'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button 
                        onClick={() => setIsScriptMode(!isScriptMode)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${isScriptMode ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        {isScriptMode ? 'Hide Script' : 'Teleprompter'}
                    </button>
                    <button 
                        onClick={handleConnect}
                        className={`px-8 py-2 rounded-xl text-sm font-black uppercase transition-all ${
                            isConnected ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40' : 'bg-white hover:bg-slate-200 text-black shadow-xl'
                        }`}
                    >
                        {isConnected ? 'Terminate Link' : 'Initialize Studio'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Script / Teleprompter */}
                <div className={`transition-all duration-500 overflow-hidden flex flex-col gap-4 ${isScriptMode ? 'w-1/3' : 'w-0 opacity-0 pointer-events-none'}`}>
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full flex flex-col shadow-2xl">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Rehearsal Script</h3>
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {scriptLines.map((line, i) => (
                                <div key={i} className={`p-4 rounded-2xl border ${line.speaker === 'AI' ? 'bg-slate-950 border-pink-900/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                    <span className={`text-[9px] font-black uppercase mb-1 block ${line.speaker === 'AI' ? 'text-pink-400' : 'text-slate-500'}`}>
                                        {line.speaker}
                                    </span>
                                    <p className="text-sm leading-relaxed text-slate-200">{line.text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-700">
                                Update Script
                            </button>
                        </div>
                    </div>
                </div>

                {/* Center: The Soundstage */}
                <div className="flex-1 bg-black border border-slate-800 rounded-[40px] relative overflow-hidden flex flex-col shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black"></div>
                    
                    {/* Visualizer Orb */}
                    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        <div className={`relative w-64 h-64 rounded-full transition-all duration-500 flex items-center justify-center ${
                            activeSpeaker === 'ai' ? 'scale-110' : activeSpeaker === 'user' ? 'scale-105' : 'scale-100'
                        }`}>
                            {/* Orbital Rings */}
                            <div className={`absolute inset-0 border-2 rounded-full border-pink-500/20 ${activeSpeaker === 'ai' ? 'animate-spin-slow' : ''}`}></div>
                            <div className={`absolute -inset-4 border border-indigo-500/10 rounded-full ${activeSpeaker === 'user' ? 'animate-reverse-spin' : ''}`}></div>
                            
                            {/* Inner Orb */}
                            <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 to-indigo-600 shadow-[0_0_100px_rgba(236,72,153,0.3)] flex items-center justify-center relative overflow-hidden ${
                                isConnected ? 'opacity-100' : 'opacity-20 grayscale'
                            }`}>
                                <div className={`absolute inset-0 bg-white/20 blur-xl ${activeSpeaker === 'ai' ? 'animate-pulse' : ''}`}></div>
                                <i className="fa-solid fa-waveform text-4xl text-white drop-shadow-xl"></i>
                            </div>

                            {/* Voice Frequency Visualization */}
                            {isConnected && (
                                <div className="absolute -bottom-20 w-full flex justify-center items-center gap-1 h-12">
                                    {Array.from({length: 20}).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-1 rounded-full transition-all duration-100 ${activeSpeaker === 'ai' ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'bg-slate-700'}`}
                                            style={{
                                                height: activeSpeaker === 'ai' ? `${Math.random() * 100}%` : '4px',
                                                opacity: activeSpeaker === 'ai' ? 1 : 0.3
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="p-10 relative z-20 flex justify-center gap-6">
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-2 flex gap-4 items-center shadow-2xl">
                             <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                             >
                                <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                             </button>
                             
                             <div className="w-px h-8 bg-slate-700"></div>

                             <div className="flex gap-2 pr-4">
                                {AI_VOICES.map((voice) => (
                                    <button
                                        key={voice.name}
                                        onClick={() => setSelectedVoice(voice.name)}
                                        title={voice.desc}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${selectedVoice === voice.name ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {voice.name.charAt(0)}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
