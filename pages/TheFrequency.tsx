import React, { useState, useEffect, useRef } from 'react';
import { analyzeAudioWaveform, generateVoiceover } from '../services/geminiService';
import { AudioProject, AudioTrack } from '../types';

const INITIAL_TRACKS: AudioTrack[] = [
    { id: '1', name: 'Voiceover - Main', type: 'voice', volume: 80, duration: '00:45' },
    { id: '2', name: 'Background Beat', type: 'music', volume: 40, duration: '01:00' },
];

export const TheFrequency: React.FC = () => {
  const [project, setProject] = useState<AudioProject>({ title: 'New Project', bpm: 120, tracks: INITIAL_TRACKS, aiSuggestions: [] });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Synthesis State
  const [synthText, setSynthText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Waveform Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
      // Simple waveform visualization loop
      const draw = () => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#6366f1'; // Indigo 500
          
          const bars = 60;
          const width = canvas.width / bars;
          
          for (let i = 0; i < bars; i++) {
              // Create a random visualizer that reacts to "playing" state
              const height = isPlaying ? Math.random() * canvas.height * 0.8 : 5;
              ctx.fillRect(i * width, (canvas.height - height) / 2, width - 2, height);
          }
          
          if (isPlaying) {
              animationRef.current = requestAnimationFrame(draw);
          }
      };

      if (isPlaying) {
          draw();
      } else {
          cancelAnimationFrame(animationRef.current);
          draw(); // Static frame
      }

      return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  const handleAnalyze = async () => {
      setIsAnalyzing(true);
      // Simulate analysis
      await new Promise(r => setTimeout(r, 1500));
      setProject(prev => ({
          ...prev,
          bpm: 124,
          aiSuggestions: ["Boost mid-range frequencies on voice", "Reduce music volume during speech segments", "Apply compression to track 1"]
      }));
      setIsAnalyzing(false);
  };

  const handleSynthesize = async () => {
      if (!synthText) return;
      setIsSynthesizing(true);
      
      const audioData = await generateVoiceover(synthText, selectedVoice);
      
      if (audioData) {
          const newTrack: AudioTrack = {
              id: `gen-${Date.now()}`,
              name: `AI Voice (${selectedVoice})`,
              type: 'voice',
              volume: 100,
              duration: '00:15' // Mock duration
          };
          setProject(prev => ({
              ...prev,
              tracks: [...prev.tracks, newTrack]
          }));
          setSynthText('');
      }
      
      setIsSynthesizing(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* DAW Header */}
       <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
            
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <i className="fa-solid fa-wave-square text-indigo-400"></i>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-widest">THE FREQUENCY</h2>
                    <p className="text-xs text-indigo-400 font-mono">Audio Intelligence Studio</p>
                </div>
            </div>

            <div className="relative z-10 flex gap-4">
                <div className="flex flex-col items-center bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">BPM</span>
                    <span className="text-xl font-mono text-emerald-400">{project.bpm}</span>
                </div>
                <div className="flex flex-col items-center bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Time</span>
                    <span className="text-xl font-mono text-white">00:00:00</span>
                </div>
            </div>
       </div>

       {/* Main Workstation */}
       <div className="flex-1 flex gap-6 overflow-hidden">
            
            {/* Track List */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-300">Tracks</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors"><i className="fa-solid fa-plus"></i></button>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors"><i className="fa-solid fa-sliders"></i></button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {project.tracks.map((track) => (
                        <div key={track.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center gap-4 group hover:bg-slate-800 transition-colors animate-fade-in">
                            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-400">
                                <i className={`fa-solid ${track.type === 'voice' ? 'fa-microphone' : track.type === 'music' ? 'fa-music' : 'fa-bolt'}`}></i>
                            </div>
                            <div className="w-32">
                                <h4 className="text-sm font-bold text-white truncate">{track.name}</h4>
                                <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full" style={{width: `${track.volume}%`}}></div>
                                </div>
                            </div>
                            
                            {/* Visual Waveform (Fake) */}
                            <div className="flex-1 h-12 bg-slate-950 rounded border border-slate-800 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                    <div className="w-full h-px bg-slate-600"></div>
                                    <div className="absolute w-full h-4 bg-indigo-500/20 blur-sm" style={{left: `${Math.random() * 50}%`, width: '30%'}}></div>
                                    {/* Simulated waveform bars */}
                                    {Array.from({length: 40}).map((_, i) => (
                                        <div key={i} className="absolute w-1 bg-slate-500" style={{
                                            left: `${i * 2.5}%`, 
                                            height: `${Math.random() * 100}%`,
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-xs bg-slate-700 hover:bg-red-500 hover:text-white text-slate-400 px-2 py-1 rounded">S</button>
                                <button className="text-xs bg-slate-700 hover:bg-yellow-500 hover:text-black text-slate-400 px-2 py-1 rounded">M</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Transport Controls */}
                <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-center items-center gap-6">
                    <button className="text-slate-400 hover:text-white"><i className="fa-solid fa-backward-step"></i></button>
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105"
                    >
                        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    <button className="text-slate-400 hover:text-white"><i className="fa-solid fa-forward-step"></i></button>
                    <button className="text-red-500 hover:text-red-400 ml-4"><i className="fa-solid fa-circle"></i></button>
                </div>
            </div>

            {/* AI Tools Panel */}
            <div className="w-80 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i> AI Synthesis
                    </h3>
                </div>
                
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Synthesis Controls */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase text-muted tracking-wider">Generate Voice Track</label>
                        <select 
                            value={selectedVoice} 
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-indigo-500 outline-none"
                        >
                            <option value="Puck">Puck (Neutral)</option>
                            <option value="Charon">Charon (Deep)</option>
                            <option value="Kore">Kore (Calm)</option>
                            <option value="Fenrir">Fenrir (Intense)</option>
                            <option value="Aoede">Aoede (Expressive)</option>
                        </select>
                        <textarea 
                            value={synthText}
                            onChange={(e) => setSynthText(e.target.value)}
                            placeholder="Enter text to synthesize..."
                            className="w-full h-24 bg-slate-900 border border-slate-600 rounded-lg p-3 text-xs text-white focus:border-indigo-500 outline-none resize-none"
                        />
                        <button 
                            onClick={handleSynthesize}
                            disabled={isSynthesizing || !synthText}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSynthesizing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-microphone-lines"></i>}
                            Synthesize Audio
                        </button>
                    </div>

                    <hr className="border-slate-700" />

                    {/* Visualizer */}
                    <div className="bg-black rounded-lg border border-slate-700 h-32 relative overflow-hidden">
                        <canvas ref={canvasRef} width="250" height="128" className="w-full h-full"></canvas>
                        <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-500">Output Monitor</div>
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-stethoscope"></i>}
                        Mastering Analysis
                    </button>

                    {project.aiSuggestions.length > 0 && (
                        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-4 animate-fade-in">
                            <h4 className="text-xs font-bold text-indigo-300 uppercase mb-2">Engineer's Notes</h4>
                            <ul className="space-y-2">
                                {project.aiSuggestions.map((tip, i) => (
                                    <li key={i} className="text-xs text-indigo-200 flex gap-2">
                                        <i className="fa-solid fa-check mt-0.5"></i>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
       </div>
    </div>
  );
};