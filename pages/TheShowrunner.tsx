
import React, { useState, useRef, useEffect } from 'react';
import { generateSeasonArc, generateEpisodeBrief, generateScriptFromBrief, generatePodcastAudio } from '../services/geminiService';
import { ShowSeason, EpisodeBrief, ShowEpisode } from '../types';

export const TheShowrunner: React.FC = () => {
  const [showTitle, setShowTitle] = useState('');
  const [showTopic, setShowTopic] = useState('');
  const [format, setFormat] = useState('Podcast');
  
  const [isPlanning, setIsPlanning] = useState(false);
  const [season, setSeason] = useState<ShowSeason | null>(null);
  
  const [selectedEpisode, setSelectedEpisode] = useState<ShowEpisode | null>(null);
  const [episodeBrief, setEpisodeBrief] = useState<EpisodeBrief | null>(null);
  const [isBriefing, setIsBriefing] = useState(false);

  // Studio Mode State
  const [activeTab, setActiveTab] = useState<'brief' | 'script' | 'audio'>('brief');
  const [script, setScript] = useState<{speaker: string, text: string}[]>([]);
  const [isScripting, setIsScripting] = useState(false);
  const [hostName, setHostName] = useState('Host');
  const [guestName, setGuestName] = useState('Guest');
  
  // Audio State
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isProducing, setIsProducing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleCreateSeason = async () => {
      if (!showTitle || !showTopic) return;
      setIsPlanning(true);
      setSeason(null);
      setSelectedEpisode(null);
      setEpisodeBrief(null);
      setScript([]);
      setAudioBase64(null);
      
      const result = await generateSeasonArc(showTitle, format, showTopic);
      setSeason(result);
      setIsPlanning(false);
  };

  const handleSelectEpisode = async (ep: ShowEpisode) => {
      setSelectedEpisode(ep);
      setEpisodeBrief(null);
      setScript([]);
      setAudioBase64(null);
      setActiveTab('brief');
      
      setIsBriefing(true);
      const brief = await generateEpisodeBrief(ep);
      setEpisodeBrief(brief);
      setIsBriefing(false);
  };

  const handleGenerateScript = async () => {
      if (!episodeBrief) return;
      setIsScripting(true);
      setActiveTab('script');
      
      const dialogue = await generateScriptFromBrief(episodeBrief, hostName, guestName);
      setScript(dialogue);
      setIsScripting(false);
  };

  const handleProduceAudio = async () => {
      if (script.length === 0) return;
      setIsProducing(true);
      setActiveTab('audio');
      
      // Map Host/Guest to specific voices
      const audioData = await generatePodcastAudio(script, 'Kore', 'Fenrir'); 
      setAudioBase64(audioData);
      setIsProducing(false);
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const playAudio = async () => {
    if (!audioBase64) return;
    
    try {
      if (isPlaying) {
          audioContextRef.current?.close();
          setIsPlaying(false);
          return;
      }

      setIsPlaying(true);
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = ctx;

      const pcmBytes = decodeBase64(audioBase64);
      const float32Data = new Float32Array(pcmBytes.length / 2);
      const dataView = new DataView(pcmBytes.buffer);
      
      for (let i = 0; i < float32Data.length; i++) {
        // Little Endian 16-bit PCM to Float32
        const int16 = dataView.getInt16(i * 2, true); 
        float32Data[i] = int16 / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.copyToChannel(float32Data, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        ctx.close();
      };
      
      source.start();
    } catch (e) {
      console.error("Error playing audio", e);
      setIsPlaying(false);
    }
  };

  // Cleanup audio context on unmount
  useEffect(() => {
      return () => {
          audioContextRef.current?.close();
      };
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Config */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent pointer-events-none"></div>
            
            <div className="flex-1 w-full space-y-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-clapperboard"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Showrunner</h2>
                        <p className="text-sm text-muted">Architect your next hit series.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Series Title</label>
                        <input 
                            type="text" 
                            value={showTitle}
                            onChange={(e) => setShowTitle(e.target.value)}
                            placeholder="e.g. 'Future of FinTech'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-red-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Topic / Niche</label>
                        <input 
                            type="text" 
                            value={showTopic}
                            onChange={(e) => setShowTopic(e.target.value)}
                            placeholder="e.g. 'Crypto, Web3, & AI'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-red-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Format</label>
                        <select 
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-red-500 outline-none"
                        >
                            <option>Podcast</option>
                            <option>YouTube Series</option>
                            <option>Docu-Series</option>
                            <option>Short-Form Series</option>
                        </select>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleCreateSeason}
                disabled={isPlanning || !showTitle}
                className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 relative z-10"
            >
                {isPlanning ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Greenlight Season'}
            </button>
       </div>

       {/* Season View */}
       <div className="flex-1 overflow-hidden flex flex-col gap-6">
            {!season ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-film text-6xl mb-4"></i>
                    <p>Pitch a show to generate the season arc.</p>
                </div>
            ) : (
                <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden">
                    {/* Episode List */}
                    <div className="lg:w-80 flex flex-col gap-4 overflow-y-auto pr-2 flex-shrink-0">
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 sticky top-0 z-10 backdrop-blur-sm">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1 block">Active Season</span>
                            <h3 className="text-lg font-bold text-white">{season.title}</h3>
                            <p className="text-sm text-slate-400 mt-1 italic">"{season.theme}"</p>
                        </div>

                        {season.episodes?.map((ep) => (
                            <div 
                                key={ep.episodeNumber}
                                onClick={() => handleSelectEpisode(ep)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-slate-800 ${
                                    selectedEpisode?.episodeNumber === ep.episodeNumber 
                                    ? 'bg-red-900/20 border-red-500 shadow-lg' 
                                    : 'bg-surface border-slate-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Ep {ep.episodeNumber}</span>
                                    {selectedEpisode?.episodeNumber === ep.episodeNumber && <i className="fa-solid fa-play text-red-500 text-xs"></i>}
                                </div>
                                <h4 className="font-bold text-white text-sm mb-2">{ep.title}</h4>
                                <p className="text-xs text-muted line-clamp-2">{ep.summary}</p>
                            </div>
                        ))}
                    </div>

                    {/* Production Studio */}
                    <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col relative">
                        {!selectedEpisode ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50">
                                <p>Select an episode to enter Studio Mode.</p>
                            </div>
                        ) : isBriefing ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 border-4 border-slate-800 border-t-red-500 rounded-full animate-spin"></div>
                                <p className="text-sm text-slate-400 animate-pulse">Developing Brief...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                {/* Studio Tabs */}
                                <div className="flex items-center bg-slate-900 border-b border-slate-700 px-6">
                                    {([
                                        { id: 'brief', label: 'Briefing Room', icon: 'fa-clipboard-list' },
                                        { id: 'script', label: 'Screenplay', icon: 'fa-file-lines' },
                                        { id: 'audio', label: 'On Air', icon: 'fa-microphone-lines' }
                                    ] as const).map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                                                activeTab === tab.id 
                                                ? 'border-red-500 text-white bg-slate-800/50' 
                                                : 'border-transparent text-muted hover:text-slate-300'
                                            }`}
                                        >
                                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 relative">
                                    {/* Briefing Tab */}
                                    {activeTab === 'brief' && episodeBrief && (
                                        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                                            <div className="text-center pb-6">
                                                <h2 className="text-2xl font-bold text-white mb-2">{episodeBrief.title}</h2>
                                                <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">{selectedEpisode.hook}</p>
                                            </div>

                                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Guest Profile</h3>
                                                    <p className="text-white text-sm font-medium">{selectedEpisode.guestIdea}</p>
                                                </div>
                                                <button 
                                                    onClick={handleGenerateScript}
                                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-white transition-colors"
                                                >
                                                    Develop Script <i className="fa-solid fa-arrow-right ml-1"></i>
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold text-white">Run of Show</h3>
                                                {episodeBrief.segments?.map((seg, idx) => (
                                                    <div key={idx} className="bg-slate-900/30 p-4 rounded-lg border border-slate-800/50">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-white text-sm">{seg.segmentName}</h4>
                                                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{seg.time}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-300 leading-relaxed mb-2">{seg.content}</p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                                                            <i className="fa-solid fa-note-sticky"></i>
                                                            {seg.notes}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Script Tab */}
                                    {activeTab === 'script' && (
                                        <div className="max-w-3xl mx-auto h-full flex flex-col animate-fade-in">
                                            {isScripting ? (
                                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                                    <div className="w-12 h-12 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
                                                    <p className="text-sm text-slate-400">Writing Dialogue...</p>
                                                </div>
                                            ) : script.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                                    <div className="p-6 bg-slate-800 rounded-full text-slate-600 mb-2">
                                                        <i className="fa-solid fa-file-lines text-4xl"></i>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white">Ready to Write</h3>
                                                    <p className="text-sm text-muted max-w-md">Generate a verbatim script based on the brief segments.</p>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white w-32"
                                                            value={hostName}
                                                            onChange={e => setHostName(e.target.value)}
                                                            placeholder="Host Name"
                                                        />
                                                        <input 
                                                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white w-32"
                                                            value={guestName}
                                                            onChange={e => setGuestName(e.target.value)}
                                                            placeholder="Guest Name"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={handleGenerateScript}
                                                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg transition-colors"
                                                    >
                                                        Generate Draft
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-6 pb-20">
                                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl min-h-[500px] font-mono text-sm leading-relaxed">
                                                        <div className="text-center text-slate-500 mb-8 border-b border-slate-800 pb-4">
                                                            <p className="uppercase tracking-widest text-xs font-bold">Screenplay • {selectedEpisode.title}</p>
                                                        </div>
                                                        {script.map((line, i) => (
                                                            <div key={i} className="mb-6">
                                                                <div className="flex justify-center mb-1">
                                                                    <span className="font-bold uppercase tracking-wider text-slate-400">{line.speaker}</span>
                                                                </div>
                                                                <div className="max-w-lg mx-auto text-center text-slate-200">
                                                                    {line.text}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="text-center text-slate-600 mt-12">
                                                            <p className="uppercase tracking-widest text-xs font-bold">[ END ]</p>
                                                        </div>
                                                    </div>
                                                    <div className="fixed bottom-8 right-8">
                                                        <button 
                                                            onClick={handleProduceAudio}
                                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                                                        >
                                                            <i className="fa-solid fa-microphone-lines"></i>
                                                            Send to Studio
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Audio Tab */}
                                    {activeTab === 'audio' && (
                                        <div className="max-w-4xl mx-auto h-full flex flex-col animate-fade-in">
                                            {isProducing ? (
                                                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 rounded-full bg-red-600 animate-ping opacity-20"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <i className="fa-solid fa-tower-broadcast text-3xl text-red-500"></i>
                                                        </div>
                                                    </div>
                                                    <p className="text-lg font-bold text-white">Synthesizing Audio...</p>
                                                    <p className="text-sm text-slate-500">Gemini 2.5 Multi-Speaker Model active</p>
                                                </div>
                                            ) : !audioBase64 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                                    <i className="fa-solid fa-microphone-slash text-4xl text-slate-700"></i>
                                                    <p className="text-muted">No audio generated yet.</p>
                                                    <button onClick={() => setActiveTab('script')} className="text-red-400 text-sm hover:underline">Go to Script</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full gap-8">
                                                    {/* Radio Player */}
                                                    <div className="w-full max-w-lg bg-black border border-slate-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">On Air</span>
                                                        </div>
                                                        
                                                        <div className="text-center mb-8 mt-4">
                                                            <h3 className="text-2xl font-bold text-white mb-1">{selectedEpisode.title}</h3>
                                                            <p className="text-sm text-slate-500 uppercase tracking-widest">{format} • Ep {selectedEpisode.episodeNumber}</p>
                                                        </div>

                                                        {/* Visualizer */}
                                                        <div className="h-32 flex items-center justify-center gap-1 mb-8">
                                                            {Array.from({length: 20}).map((_, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className={`w-2 bg-red-500 rounded-full transition-all duration-100 ease-in-out ${isPlaying ? 'animate-pulse' : 'h-1'}`}
                                                                    style={{
                                                                        height: isPlaying ? `${Math.random() * 80 + 20}%` : '4px',
                                                                        opacity: isPlaying ? 1 : 0.3
                                                                    }}
                                                                ></div>
                                                            ))}
                                                        </div>

                                                        {/* Controls */}
                                                        <div className="flex justify-center items-center gap-8">
                                                            <button className="text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-backward-step text-xl"></i></button>
                                                            <button 
                                                                onClick={playAudio}
                                                                className="w-16 h-16 bg-white hover:bg-slate-200 rounded-full flex items-center justify-center text-black text-2xl transition-transform hover:scale-105 shadow-lg"
                                                            >
                                                                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'}`}></i>
                                                            </button>
                                                            <button className="text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-forward-step text-xl"></i></button>
                                                        </div>
                                                    </div>

                                                    <a 
                                                        href={`data:audio/wav;base64,${audioBase64}`} 
                                                        download="episode_mix.wav"
                                                        className="text-xs text-slate-400 hover:text-white flex items-center gap-2 transition-colors border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800"
                                                    >
                                                        <i className="fa-solid fa-download"></i> Download Master File
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};
