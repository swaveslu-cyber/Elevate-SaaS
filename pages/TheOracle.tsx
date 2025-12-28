
import React, { useState } from 'react';
import { consultOracle } from '../services/geminiService';
import { OracleResult } from '../types';

export const TheOracle: React.FC = () => {
  const [hypothesis, setHypothesis] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [prediction, setPrediction] = useState<OracleResult | null>(null);

  const handleConsult = async () => {
      if (!hypothesis) return;
      setIsConsulting(true);
      setPrediction(null);
      const result = await consultOracle(hypothesis);
      setPrediction(result);
      setIsConsulting(false);
  };

  return (
    <div className="h-full flex flex-col gap-6 relative overflow-hidden bg-black rounded-xl border border-slate-800">
        
        {/* Ambient Void Background */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        </div>

        {/* Input Area (Top) */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-12 px-6">
            <h2 className="text-3xl font-light text-indigo-300 tracking-[0.2em] mb-8 flex items-center gap-4">
                <i className="fa-solid fa-eye text-indigo-500 animate-pulse-slow"></i> THE ORACLE
            </h2>
            
            <div className="w-full max-w-2xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                    <input 
                        type="text" 
                        value={hypothesis}
                        onChange={(e) => setHypothesis(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                        placeholder="State your strategic hypothesis..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-full py-4 px-8 text-center text-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-2xl placeholder-slate-600"
                    />
                    <button 
                        onClick={handleConsult}
                        disabled={isConsulting || !hypothesis}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white transition-all shadow-lg disabled:opacity-50 disabled:scale-95"
                    >
                        {isConsulting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-arrow-right"></i>}
                    </button>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 uppercase tracking-widest">Gemini Reasoning Engine Active</p>
        </div>

        {/* Output Visualization */}
        <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6">
            {!prediction && !isConsulting ? (
                <div className="text-center opacity-30 animate-pulse-slow">
                    <div className="w-64 h-64 rounded-full border border-indigo-500/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-spin-slow" style={{animationDuration: '10s'}}></div>
                        <div className="w-48 h-48 rounded-full bg-indigo-900/10 blur-xl"></div>
                        <i className="fa-solid fa-crystal-ball text-6xl text-indigo-400"></i>
                    </div>
                </div>
            ) : isConsulting ? (
                <div className="text-center">
                    <div className="w-32 h-32 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-6 mx-auto"></div>
                    <p className="text-indigo-300 font-mono text-sm">Simulating Timelines...</p>
                </div>
            ) : prediction ? (
                <div className="w-full max-w-6xl h-full flex flex-col animate-fade-in-up">
                    
                    {/* Top Stats */}
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Success Probability</div>
                            <div className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                                {prediction.successProbability}%
                                <span className={`text-sm ${prediction.successProbability > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    <i className={`fa-solid ${prediction.successProbability > 70 ? 'fa-arrow-trend-up' : 'fa-minus'}`}></i>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto pb-4">
                        {prediction.scenarios?.map((scenario, idx) => (
                            <div key={idx} className={`bg-slate-900/80 backdrop-blur-md border rounded-xl p-6 flex flex-col relative group overflow-hidden ${scenario.color}`}>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-white uppercase tracking-wider">{scenario.name}</h3>
                                    <span className="text-xs font-mono font-bold opacity-80">{scenario.probability}% Chance</span>
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">{scenario.description}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs font-bold text-white mb-1 uppercase opacity-70">Impact</p>
                                    <p className="text-xs text-slate-400 italic">"{scenario.impact}"</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Risk/Opportunity Footer */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4 flex items-start gap-4">
                            <i className="fa-solid fa-triangle-exclamation text-red-500 mt-1"></i>
                            <div>
                                <h4 className="text-xs font-bold text-red-400 uppercase mb-1">Critical Risk</h4>
                                <p className="text-sm text-red-200/80">{prediction.biggestRisk}</p>
                            </div>
                        </div>
                        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-4">
                            <i className="fa-solid fa-star text-emerald-500 mt-1"></i>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">Golden Opportunity</h4>
                                <p className="text-sm text-emerald-200/80">{prediction.biggestOpportunity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    </div>
  );
};
