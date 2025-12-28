import React, { useState } from 'react';
import { transmuteContent } from '../services/geminiService';
import { TransmutationResult } from '../types';

const MODES = [
    { id: 'Lead into Gold', icon: 'fa-coins', desc: 'Boring to Viral', color: 'text-yellow-400' },
    { id: 'Water into Wine', icon: 'fa-wine-glass', desc: 'Facts to Story', color: 'text-purple-400' },
    { id: 'Stone into Bread', icon: 'fa-bread-slice', desc: 'Complex to Simple', color: 'text-orange-400' },
    { id: 'Iron into Steel', icon: 'fa-shield-halved', desc: 'Weak to Strong', color: 'text-slate-200' },
];

export const TheAlchemist: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedMode, setSelectedMode] = useState(MODES[0].id);
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [result, setResult] = useState<TransmutationResult | null>(null);

  const handleTransmute = async () => {
      if (!content) return;
      setIsTransmuting(true);
      setResult(null);
      
      // Artificial delay for "magic" effect
      await new Promise(r => setTimeout(r, 1000));
      
      const data = await transmuteContent(content, selectedMode);
      setResult(data);
      setIsTransmuting(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Alchemic Laboratory */}
       <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black rounded-xl border border-indigo-900/50 relative overflow-hidden">
            
            {/* Background Magic */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
            
            {/* Input Vessel */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 relative z-10">
                <div className="text-center mb-2">
                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Base Material</h3>
                </div>
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste raw content here..."
                    className="w-full h-64 bg-slate-900/80 border border-slate-700 rounded-xl p-6 text-sm resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none shadow-inner text-slate-300"
                />
            </div>

            {/* Transmutation Circle (Controls) */}
            <div className="flex flex-col items-center gap-8 relative z-10">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Animated Rings */}
                    <div className={`absolute inset-0 border-2 border-indigo-500/30 rounded-full ${isTransmuting ? 'animate-spin-slow' : ''}`}></div>
                    <div className={`absolute inset-4 border-2 border-purple-500/30 rounded-full ${isTransmuting ? 'animate-reverse-spin' : ''}`}></div>
                    
                    {/* Central Button */}
                    <button 
                        onClick={handleTransmute}
                        disabled={isTransmuting || !content}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group"
                    >
                        <i className={`fa-solid fa-flask text-2xl text-white ${isTransmuting ? 'fa-bounce' : ''}`}></i>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Transmute</span>
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-3 w-64">
                    {MODES.map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => setSelectedMode(mode.id)}
                            className={`p-3 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                                selectedMode === mode.id 
                                ? 'bg-indigo-900/50 border-indigo-500 text-white shadow-lg' 
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <i className={`fa-solid ${mode.icon} ${mode.color} text-lg mb-1`}></i>
                            <span>{mode.id}</span>
                            <span className="text-[9px] font-normal opacity-70">{mode.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Output Vessel */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 relative z-10">
                <div className="text-center mb-2">
                    <h3 className="text-lg font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        {isTransmuting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-gem"></i>}
                        The Gold
                    </h3>
                </div>
                <div className="w-full h-64 bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden group">
                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-full text-indigo-300/30">
                            <i className="fa-solid fa-sparkles text-4xl mb-4"></i>
                            <p className="text-sm">Awaiting transmutation...</p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-y-auto pr-2 text-sm text-indigo-100 leading-relaxed whitespace-pre-wrap">
                                {result.transmuted}
                            </div>
                            <div className="mt-4 pt-4 border-t border-indigo-500/20 flex justify-between items-center">
                                <span className="text-xs text-indigo-400">{result.changes.length} Changes Applied</span>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(result.transmuted)}
                                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded transition-colors shadow-lg"
                                >
                                    Collect Gold
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
       </div>

       {/* Analysis Panel (Slide up if result) */}
       {result && (
           <div className="bg-surface border border-slate-700 rounded-xl p-6 animate-fade-in-up">
               <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Transmutation Analysis</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {result.changes.map((change, i) => (
                       <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 flex items-start gap-2">
                           <i className="fa-solid fa-wand-magic-sparkles text-indigo-400 mt-0.5"></i>
                           {change}
                       </div>
                   ))}
               </div>
           </div>
       )}
    </div>
  );
};