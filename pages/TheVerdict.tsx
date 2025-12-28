import React, { useState } from 'react';
import { predictABTest } from '../services/geminiService';
import { VerdictResult } from '../types';

export const TheVerdict: React.FC = () => {
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [context, setContext] = useState('');
  const [isJudging, setIsJudging] = useState(false);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);

  const handleJudge = async () => {
      if (!optionA || !optionB || !context) return;
      setIsJudging(true);
      setVerdict(null);
      
      // Simulate judging delay for suspense
      await new Promise(r => setTimeout(r, 1500));
      
      const result = await predictABTest(optionA, optionB, context);
      setVerdict(result);
      setIsJudging(false);
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-emerald-400';
      if (score >= 60) return 'text-amber-400';
      return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col gap-6 relative">
       
       {/* The Arena Input */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col gap-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-gavel text-indigo-500"></i> The Verdict
                    </h2>
                    <p className="text-sm text-muted">AI Conversion Rate Predictor (CRO)</p>
                </div>
            </div>

            <div className="relative z-10">
                <label className="text-xs font-bold uppercase text-muted mb-2 block">Test Context</label>
                <input 
                    type="text" 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. 'Email Subject Line for Black Friday', 'Landing Page Headline for SaaS'..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none shadow-inner"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className={`p-6 rounded-xl border-2 transition-all ${
                    verdict?.winner === 'A' ? 'border-emerald-500 bg-emerald-900/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-slate-700 bg-slate-900/50'
                }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Variant A</h3>
                        {verdict?.winner === 'A' && <i className="fa-solid fa-trophy text-emerald-400 text-xl animate-bounce"></i>}
                    </div>
                    <textarea 
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        placeholder="Enter first option..."
                        className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-4 text-sm focus:border-indigo-500 outline-none resize-none"
                    />
                </div>

                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center font-black text-slate-500 text-xl shadow-xl">VS</div>
                </div>

                <div className={`p-6 rounded-xl border-2 transition-all ${
                    verdict?.winner === 'B' ? 'border-emerald-500 bg-emerald-900/10 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-slate-700 bg-slate-900/50'
                }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Variant B</h3>
                        {verdict?.winner === 'B' && <i className="fa-solid fa-trophy text-emerald-400 text-xl animate-bounce"></i>}
                    </div>
                    <textarea 
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Enter second option..."
                        className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-4 text-sm focus:border-indigo-500 outline-none resize-none"
                    />
                </div>
            </div>

            <button 
                onClick={handleJudge}
                disabled={isJudging || !optionA || !optionB || !context}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 text-lg relative z-10"
            >
                {isJudging ? <><i className="fa-solid fa-scale-balanced fa-beat mr-2"></i> Deliberating...</> : 'Predict Winner'}
            </button>
       </div>

       {/* The Ruling */}
       {verdict && (
           <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden flex flex-col relative animate-fade-in-up">
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-y-auto">
                    
                    {/* Scorecard */}
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col justify-center">
                        <div className="text-center mb-6">
                            <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">Confidence Level</span>
                            <div className="text-5xl font-black text-white flex items-center justify-center gap-2">
                                {verdict.confidence}%
                                <i className="fa-solid fa-shield-check text-emerald-500 text-2xl"></i>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-sm font-bold text-slate-400">Metric</span>
                                <div className="flex gap-8">
                                    <span className="text-sm font-bold text-slate-300 w-8 text-center">A</span>
                                    <span className="text-sm font-bold text-slate-300 w-8 text-center">B</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">Clarity</span>
                                <div className="flex gap-8">
                                    <span className={`text-sm font-bold w-8 text-center ${getScoreColor(verdict.scores.a_clarity)}`}>{verdict.scores.a_clarity}</span>
                                    <span className={`text-sm font-bold w-8 text-center ${getScoreColor(verdict.scores.b_clarity)}`}>{verdict.scores.b_clarity}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">Persuasion</span>
                                <div className="flex gap-8">
                                    <span className={`text-sm font-bold w-8 text-center ${getScoreColor(verdict.scores.a_persuasion)}`}>{verdict.scores.a_persuasion}</span>
                                    <span className={`text-sm font-bold w-8 text-center ${getScoreColor(verdict.scores.b_persuasion)}`}>{verdict.scores.b_persuasion}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-300">Hook</span>
                                <div className="flex gap-8">
                                    <span className={`text-sm font-bold w-8 text-center ${getScoreColor(verdict.scores.a_hook)}`}>{verdict.scores.a_hook}</span>
                                    <span className={`text-sm font-bold w-8 text-center ${getScoreColor(verdict.scores.b_hook)}`}>{verdict.scores.b_hook}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-brain text-indigo-400"></i> The Why
                            </h3>
                            <p className="text-slate-200 leading-relaxed text-sm">
                                {verdict.reasoning}
                            </p>
                        </div>

                        <div className="bg-surface border border-slate-700 rounded-xl p-6">
                            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-lightbulb text-yellow-400"></i> Optimization Tips
                            </h3>
                            <ul className="space-y-3">
                                {verdict.tips.map((tip, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                                        <i className="fa-solid fa-check text-emerald-500 mt-1"></i>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
           </div>
       )}
    </div>
  );
};