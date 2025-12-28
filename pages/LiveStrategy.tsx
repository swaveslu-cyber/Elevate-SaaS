import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- HELPER FUNCTIONS FOR AUDIO ENCODING/DECODING ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp to 16-bit range
    let s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveStrategy: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState("Ready to Connect");
  const [activeSpeaker, setActiveSpeaker] = useState<'user' | 'ai' | 'none'>('none');
  const [videoMode, setVideoMode] = useState<'none' | 'camera' | 'screen' | 'whiteboard'>('none');
  
  // Whiteboard State
  const [brushColor, setBrushColor] = useState('#10b981'); // Emerald
  const [isDrawing, setIsDrawing] = useState(false);

  // Refs for Audio Resources
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Refs for Video/Visual Resources
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For capturing video frames
  const whiteboardRef = useRef<HTMLCanvasElement>(null); // For drawing
  const videoStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const lastDrawPos = useRef<{x: number, y: number} | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (sessionRef.current) sessionRef.current = null;

    if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
    }
    if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
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
    setStatusText("Disconnected");
    setActiveSpeaker('none');
    setVideoMode('none');
    nextStartTimeRef.current = 0;
  };

  useEffect(() => {
    // Initialize Whiteboard
    if (whiteboardRef.current) {
        const ctx = whiteboardRef.current.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#0f172a'; // Slate 950 background
            ctx.fillRect(0, 0, whiteboardRef.current.width, whiteboardRef.current.height);
        }
    }
    return () => cleanup();
  }, []);

  // --- WHITEBOARD HANDLERS ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const pos = getPos(e);
      lastDrawPos.current = pos;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !whiteboardRef.current) return;
      const ctx = whiteboardRef.current.getContext('2d');
      if (!ctx || !lastDrawPos.current) return;

      const currentPos = getPos(e);
      
      ctx.beginPath();
      ctx.moveTo(lastDrawPos.current.x, lastDrawPos.current.y);
      ctx.lineTo(currentPos.x, currentPos.y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      lastDrawPos.current = currentPos;
  };

  const stopDrawing = () => {
      setIsDrawing(false);
      lastDrawPos.current = null;
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
      if (!whiteboardRef.current) return { x: 0, y: 0 };
      const rect = whiteboardRef.current.getBoundingClientRect();
      let clientX, clientY;
      
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }
      
      return {
          x: (clientX - rect.left) * (whiteboardRef.current.width / rect.width),
          y: (clientY - rect.top) * (whiteboardRef.current.height / rect.height)
      };
  };

  const clearWhiteboard = () => {
      if (whiteboardRef.current) {
          const ctx = whiteboardRef.current.getContext('2d');
          if (ctx) {
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(0, 0, whiteboardRef.current.width, whiteboardRef.current.height);
          }
      }
  };

  // --- VIDEO HANDLERS ---
  const stopVideo = () => {
    if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
    }
    if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setVideoMode('none');
  };

  const startStream = async (mode: 'camera' | 'screen' | 'whiteboard') => {
      if (videoMode === mode) {
          stopVideo();
          return;
      }
      
      // Stop current mode first
      if (videoMode !== 'none') stopVideo();

      try {
          setVideoMode(mode);

          if (mode !== 'whiteboard') {
              let stream: MediaStream;
              if (mode === 'camera') {
                  stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
              } else {
                  stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: 1920, height: 1080 } });
              }
              videoStreamRef.current = stream;
              if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  await videoRef.current.play();
              }
          }

          // Start Frame Capture Loop (Common for all visual modes)
          frameIntervalRef.current = window.setInterval(() => {
              if (!sessionRef.current) return;

              let base64Data = '';

              if (mode === 'whiteboard') {
                  if (whiteboardRef.current) {
                      base64Data = whiteboardRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                  }
              } else {
                  // Capture from Video Element
                  const video = videoRef.current;
                  const canvas = canvasRef.current;
                  if (video && canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                          canvas.width = video.videoWidth * 0.5;
                          canvas.height = video.videoHeight * 0.5;
                          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                          base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                      }
                  }
              }
              
              if (base64Data) {
                  sessionRef.current.sendRealtimeInput({
                      media: { mimeType: 'image/jpeg', data: base64Data }
                  });
              }
          }, 1000); // 1 FPS

          if (mode !== 'whiteboard' && videoStreamRef.current) {
              videoStreamRef.current.getVideoTracks()[0].onended = () => stopVideo();
          }

      } catch (err) {
          console.error("Failed to start stream", err);
          setVideoMode('none');
      }
  };

  const handleConnect = async () => {
    if (isConnected) {
        cleanup();
        return;
    }

    setStatusText("Connecting...");
    
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key missing");

        const ai = new GoogleGenAI({ apiKey });
        
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setStatusText("Connected • Listening");
                    setIsConnected(true);
                    
                    if (!inputAudioContextRef.current || !audioStreamRef.current) return;
                    
                    sourceRef.current = inputAudioContextRef.current.createMediaStreamSource(audioStreamRef.current);
                    processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    processorRef.current.onaudioprocess = (e) => {
                        if (isMuted) return;
                        const inputData = e.inputBuffer.getChannelData(0);
                        
                        // VAD
                        let sum = 0;
                        for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
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
                    const ctx = outputAudioContextRef.current;
                    if (!ctx) return;

                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    
                    if (base64Audio) {
                        setActiveSpeaker('ai');
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
                onclose: () => { setStatusText("Connection Closed"); setIsConnected(false); },
                onerror: (err) => { console.error(err); setStatusText("Connection Error"); setIsConnected(false); }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                systemInstruction: "You are Elevate, an expert visual strategist. The user might share their camera, screen, or draw on a whiteboard. Analyze what you see in real-time. If they draw a funnel, critique it. If they show a product, analyze its design. Be helpful, concise, and professional."
            }
        });

    } catch (error) {
        console.error("Connection failed", error);
        setStatusText("Failed to Connect");
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
        {/* Hidden Elements */}
        <video ref={videoRef} className="hidden" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />

        {/* --- MAIN DISPLAY AREA --- */}
        <div className="absolute inset-0 z-0">
            {videoMode === 'whiteboard' ? (
                <div className="w-full h-full relative cursor-crosshair">
                    <canvas 
                        ref={whiteboardRef}
                        width={1280}
                        height={720}
                        className="w-full h-full object-contain bg-slate-950"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                    
                    {/* Whiteboard Controls */}
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-full flex items-center gap-2 shadow-xl">
                        {['#10b981', '#3b82f6', '#f43f5e', '#fbbf24', '#ffffff'].map(c => (
                            <button
                                key={c}
                                onClick={() => setBrushColor(c)}
                                className={`w-8 h-8 rounded-full border-2 ${brushColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{backgroundColor: c}}
                            />
                        ))}
                        <div className="w-px h-6 bg-slate-600 mx-1"></div>
                        <button onClick={clearWhiteboard} className="text-slate-400 hover:text-white px-3 py-1 text-xs font-bold uppercase">Clear</button>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse flex items-center gap-2">
                        <i className="fa-solid fa-eye"></i> AI Watching Whiteboard
                    </div>
                </div>
            ) : videoMode !== 'none' ? (
                 <div className="w-full h-full relative">
                      <video 
                         ref={el => { if (el && videoStreamRef.current) el.srcObject = videoStreamRef.current; }}
                         autoPlay 
                         muted 
                         className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
                      <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse flex items-center gap-2">
                        <i className="fa-solid fa-video"></i> Streaming Input
                    </div>
                 </div>
            ) : (
                 <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-indigo-950/20 pointer-events-none flex items-center justify-center">
                     {/* Ambient Visualizer */}
                     <div className={`w-64 h-64 rounded-full bg-indigo-500/20 blur-[100px] transition-all duration-500 ${activeSpeaker === 'ai' ? 'scale-150 opacity-80' : 'scale-100 opacity-40'}`}></div>
                 </div>
            )}
        </div>
        
        {/* --- UI OVERLAY --- */}
        <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center pointer-events-none">
            
            {/* Center Orb (Only visible when no video active) */}
            {videoMode === 'none' && (
                <div className="mb-12 pointer-events-auto">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all duration-300 flex items-center justify-center relative overflow-hidden ${activeSpeaker === 'ai' ? 'scale-110' : 'scale-100'}`}>
                         <div className={`absolute inset-0 bg-gradient-to-t from-purple-800 to-transparent opacity-50 ${activeSpeaker === 'ai' ? 'animate-pulse' : ''}`}></div>
                         <i className="fa-solid fa-microphone-lines text-3xl text-white/90 drop-shadow-lg"></i>
                    </div>
                    {activeSpeaker === 'user' && <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"></div>}
                </div>
            )}

            {/* Status Bar */}
            <div className="mb-6 px-6 py-2 rounded-full border bg-slate-900/80 border-slate-700 backdrop-blur-md text-sm font-medium flex items-center gap-3 shadow-lg pointer-events-auto">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                <span className={isConnected ? 'text-emerald-100' : 'text-muted'}>{statusText}</span>
            </div>

            {/* Control Dock */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-600 p-4 rounded-3xl flex items-center gap-4 shadow-2xl pointer-events-auto transition-transform hover:scale-[1.02]">
                 {/* Mute */}
                 <button 
                    onClick={toggleMute}
                    disabled={!isConnected}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    title="Mute Mic"
                 >
                    <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                 </button>

                 <div className="h-8 w-px bg-slate-700"></div>

                 {/* Vision Modes */}
                 <button 
                    onClick={() => startStream('camera')}
                    disabled={!isConnected}
                    className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${videoMode === 'camera' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800'}`}
                 >
                    <i className="fa-solid fa-video text-lg"></i>
                    <span className="text-[9px] font-bold uppercase">Cam</span>
                 </button>

                 <button 
                    onClick={() => startStream('screen')}
                    disabled={!isConnected}
                    className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${videoMode === 'screen' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800'}`}
                 >
                    <i className="fa-solid fa-desktop text-lg"></i>
                    <span className="text-[9px] font-bold uppercase">Screen</span>
                 </button>

                 <button 
                    onClick={() => startStream('whiteboard')}
                    disabled={!isConnected}
                    className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${videoMode === 'whiteboard' ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800'}`}
                 >
                    <i className="fa-solid fa-pen-to-square text-lg"></i>
                    <span className="text-[9px] font-bold uppercase">Draw</span>
                 </button>

                 <div className="h-8 w-px bg-slate-700"></div>

                 {/* Session Control */}
                 <button 
                    onClick={handleConnect}
                    className={`px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all min-w-[120px] ${
                        isConnected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'
                    }`}
                 >
                    {isConnected ? 'End' : 'Connect'}
                 </button>
            </div>
        </div>
    </div>
  );
};