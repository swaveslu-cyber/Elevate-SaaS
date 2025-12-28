import React, { useState } from 'react';
import { refractIdea } from '../services/geminiService';
import { PrismAngle } from '../types';

export const ThePrism: React.FC = () => {
  const [coreBelief, setCoreBelief] = useState('');
  const [isRefracting, setIsRefracting] = useState(false);
  const [angles, setAngles] = useState<PrismAngle[]>([]);

  const handleRefract = async () => {
      if (!coreBelief) return;
      setIsRefracting(true);
      setAngles([]);
      const result = await refractIdea(coreBelief);
      setAngles(result);
      setIsRefracting(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-slate-950 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-slate-800 to-transparent opacity-20 blur-3xl"></div>
        </div>

        {/* Input Area (Top) */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-8">
            <h2 className="text-3xl font-light text-white tracking-widest mb-6 flex items-center gap-3">
                <i className="fa-solid fa-shapes text-white opacity-80"></i> THE PRISM
            </h2>
            
            <div className="w-full max-w-2xl relative group">
                <input 
                    type="text" 
                    value={coreBelief}
                    onChange={(e) => setCoreBelief(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefract()}
                    placeholder="Enter a core truth (e.g. 'Remote work is essential')..."
                    className="w-full bg-black/40 border border-slate-600 rounded-full py-4 px-8 text-center text-lg text-white focus:border-white/50 focus:ring-1 focus:ring-white/20 outline-none transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
                />
                
                {/* Refract Button */}
                <button 
                    onClick={handleRefract}
                    disabled={isRefracting || !coreBelief}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-slate-200 rounded-full flex items-center justify-center text-black transition-all shadow-lg disabled:opacity-50 disabled:scale-95"
                >
                    {isRefracting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                </button>
            </div>
        </div>

        {/* The Visual Prism (Center) */}
        <div className="flex-1 relative flex items-center justify-center z-10">
            {!isRefracting && angles.length === 0 ? (
                <div className="w-32 h-32 border-2 border-white/20 rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <div className="w-20 h-20 border border-white/10 rotate-45"></div>
                </div>
            ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                    {/* Central Light Source */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full blur-2xl animate-pulse z-20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full z-30"></div>

                    {/* Refracted Angles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-6 h-full overflow-y-auto py-10 items-center">
                        {angles.map((angle, idx) => (
                            <div 
                                key={idx} 
                                className={`bg-slate-900/80 backdrop-blur-xl border ${angle.color.split(' ')[0]} p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-500 animate-fade-in-up group`}
                                style={{animationDelay: `${idx * 150}ms`}}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-black/30 ${angle.color.split(' ')[1]}`}>
                                        <i className={`fa-solid ${angle.icon}`}></i>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-1 rounded ${angle.color.replace('text-', 'border-').replace('border-', 'text-')}`}>
                                        {angle.name}
                                    </span>
                                </div>
                                
                                <h3 className="text-white font-bold text-lg mb-2 leading-tight">{angle.headline}</h3>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4">{angle.content}</p>
                                
                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-mono">Trigger: {angle.trigger}</span>
                                    <button className="text-xs text-white hover:text-slate-300 transition-colors">
                                        <i className="fa-regular fa-copy mr-1"></i> Copy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};