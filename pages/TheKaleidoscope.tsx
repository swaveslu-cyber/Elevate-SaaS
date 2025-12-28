import React, { useState } from 'react';
import { generateKaleidoscopeRemix, generateSocialImage } from '../services/geminiService';
import { KaleidoscopeRemix } from '../types';

const VIBES = [
    { id: 'Cyberpunk', icon: 'fa-microchip', color: 'text-cyan-400' },
    { id: 'Cottagecore', icon: 'fa-leaf', color: 'text-emerald-400' },
    { id: 'Corporate Memphis', icon: 'fa-building', color: 'text-blue-400' },
    { id: 'Gen Z Chaos', icon: 'fa-face-dizzy', color: 'text-purple-400' },
    { id: 'Noir', icon: 'fa-user-secret', color: 'text-slate-400' },
    { id: 'Y2K', icon: 'fa-compact-disc', color: 'text-pink-400' },
    { id: 'Minimalist', icon: 'fa-square', color: 'text-white' },
    { id: 'Vaporwave', icon: 'fa-water', color: 'text-fuchsia-400' },
];

export const TheKaleidoscope: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [remixes, setRemixes] = useState<KaleidoscopeRemix[]>([]);
  const [generatingVisualFor, setGeneratingVisualFor] = useState<string | null>(null);

  const toggleVibe = (id: string) => {
      if (selectedVibes.includes(id)) {
          setSelectedVibes(selectedVibes.filter(v => v !== id));
      } else if (selectedVibes.length < 3) {
          setSelectedVibes([...selectedVibes, id]);
      }
  };

  const handleSpin = async () => {
      if (!content || selectedVibes.length === 0) return;
      setIsSpinning(true);
      setRemixes([]);
      
      const results = await generateKaleidoscopeRemix(content, selectedVibes);
      setRemixes(results);
      setIsSpinning(false);
  };

  const handleGenerateVisual = async (remix: KaleidoscopeRemix) => {
      setGeneratingVisualFor(remix.vibe);
      const imageUrl = await generateSocialImage(remix.visualPrompt, { aspectRatio: '1:1', highQuality: false });
      
      if (imageUrl) {
          setRemixes(prev => prev.map(r => r.vibe === remix.vibe ? { ...r, generatedImageUrl: imageUrl } : r));
      }
      setGeneratingVisualFor(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Controls */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-fuchsia-900/10 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <i className="fa-solid fa-fan fa-spin-slow"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">The Kaleidoscope</h2>
                            <p className="text-sm text-muted">Culture Remix Engine</p>
                        </div>
                    </div>
                    
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter your core message (e.g. 'We are launching a new coffee blend')..."
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none resize-none shadow-inner"
                    />
                </div>

                <div className="w-full md:w-80">
                    <label className="text-xs font-bold uppercase text-muted tracking-wider mb-3 block">Select Lenses (Max 3)</label>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {VIBES.map(vibe => (
                            <button
                                key={vibe.id}
                                onClick={() => toggleVibe(vibe.id)}
                                className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${
                                    selectedVibes.includes(vibe.id)
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                <i className={`fa-solid ${vibe.icon} ${selectedVibes.includes(vibe.id) ? 'text-white' : vibe.color}`}></i>
                                {vibe.id}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleSpin}
                        disabled={isSpinning || !content || selectedVibes.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:opacity-90 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSpinning ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Spinning...</> : 'Spin Kaleidoscope'}
                    </button>
                </div>
            </div>
       </div>

       {/* Results */}
       <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden relative">
            {!remixes.length ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-hurricane text-8xl mb-6"></i>
                    <p className="text-lg">Waiting to fracture reality.</p>
                </div>
            ) : (
                <div className="h-full overflow-x-auto overflow-y-hidden p-8 flex items-center gap-8">
                    {remixes.map((remix, idx) => (
                        <div key={idx} className="w-80 flex-shrink-0 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-2xl hover:scale-105 transition-transform duration-300 group">
                            
                            {/* Visual Header */}
                            <div className="relative aspect-square bg-slate-900 group-hover:border-b border-indigo-500/50 transition-colors">
                                {remix.generatedImageUrl ? (
                                    <img src={remix.generatedImageUrl} alt={remix.vibe} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                        <p className="text-[10px] text-slate-500 mb-4 font-mono leading-tight line-clamp-4">"{remix.visualPrompt}"</p>
                                        <button 
                                            onClick={() => handleGenerateVisual(remix)}
                                            disabled={generatingVisualFor === remix.vibe}
                                            className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-white rounded-full text-xs font-bold transition-colors border border-slate-600 hover:border-indigo-500"
                                        >
                                            {generatingVisualFor === remix.vibe ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Render Visual'}
                                        </button>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                    {remix.vibe}
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-surface to-slate-900">
                                <div className="mb-4">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 block">Format</span>
                                    <p className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded inline-block">{remix.format}</p>
                                </div>
                                <p className="text-sm text-white leading-relaxed font-medium">"{remix.copy}"</p>
                                
                                <div className="mt-auto pt-6 flex justify-end">
                                    <button className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                        <i className="fa-regular fa-copy"></i> Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
       </div>
    </div>
  );
};