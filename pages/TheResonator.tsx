
import React, { useState } from 'react';
import { analyzeAudienceFeedback } from '../services/geminiService';
import { ResonatorAnalysis } from '../types';

export const TheResonator: React.FC = () => {
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isTuning, setIsTuning] = useState(false);
  const [analysis, setAnalysis] = useState<ResonatorAnalysis | null>(null);

  const handleTune = async () => {
      if (!feedbackInput) return;
      setIsTuning(true);
      setAnalysis(null);
      const result = await analyzeAudienceFeedback(feedbackInput);
      setAnalysis(result);
      setIsTuning(false);
  };

  const copyText = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Input Control */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-teal-900/10 pointer-events-none"></div>
            
            <div className="flex-1 w-full space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <i className="fa-solid fa-volume-high"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Resonator</h2>
                        <p className="text-sm text-muted">Audience Frequency Tuner</p>
                    </div>
                </div>

                <textarea 
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Paste raw feedback here (e.g. comments, reviews, support tickets, survey responses)..."
                    className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm focus:border-cyan-500 outline-none resize-none shadow-inner"
                />
                
                <button 
                    onClick={handleTune}
                    disabled={isTuning || !feedbackInput}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-90 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
                >
                    {isTuning ? <><i className="fa-solid fa-wave-square fa-beat mr-2"></i> Tuning Frequency...</> : 'Analyze Resonance'}
                </button>
            </div>
       </div>

       {/* Analysis Dashboard */}
       <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden relative">
            {!analysis ? (
                <div className="flex-1 h-full flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-ear-listen text-6xl mb-4"></i>
                    <p className="text-lg">Waiting for signal input.</p>
                </div>
            ) : (
                <div className="h-full overflow-y-auto p-8 animate-fade-in">
                    <div className="max-w-5xl mx-auto space-y-8">
                        
                        {/* High Level Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Overall Sentiment</h4>
                                <div className="text-2xl font-bold text-white capitalize">{analysis.sentiment}</div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 md:col-span-2">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Key Themes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.themes?.map((theme, i) => (
                                        <span key={i} className="px-3 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 rounded-full text-sm font-medium">
                                            {theme}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* FAQ Generator */}
                            <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <i className="fa-solid fa-circle-question text-amber-400"></i> Burning Questions
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4 flex-1">
                                    {analysis.topQuestions?.map((q, i) => (
                                        <div key={i} className="flex gap-3">
                                            <span className="text-amber-500 font-bold">{i+1}.</span>
                                            <p className="text-slate-300 text-sm">{q}</p>
                                        </div>
                                    ))}
                                    <button className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors">
                                        Generate FAQ Post
                                    </button>
                                </div>
                            </div>

                            {/* Content Opportunities */}
                            <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <i className="fa-solid fa-lightbulb text-yellow-400"></i> Content Gaps
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4 flex-1">
                                    {analysis.contentOpportunities?.map((opp, i) => (
                                        <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-yellow-500/30 transition-colors">
                                            <h4 className="font-bold text-white text-sm mb-1">{opp.title}</h4>
                                            <p className="text-xs text-slate-400">{opp.premise}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Wall of Love & VOC */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-surface rounded-xl border border-slate-700 p-6">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                    <i className="fa-solid fa-heart text-pink-500"></i> Golden Quotes (Social Proof)
                                </h3>
                                <div className="space-y-4">
                                    {analysis.goldenQuotes?.map((quote, i) => (
                                        <div key={i} className="relative pl-6">
                                            <div className="absolute left-0 top-0 text-2xl text-slate-600 font-serif">"</div>
                                            <p className="text-slate-300 text-sm italic leading-relaxed">{quote}</p>
                                            <button onClick={() => copyText(quote)} className="text-[10px] text-muted hover:text-white mt-2 flex items-center gap-1">
                                                <i className="fa-regular fa-copy"></i> Copy for Graphic
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-surface rounded-xl border border-slate-700 p-6">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                                    <i className="fa-solid fa-bullhorn text-teal-400"></i> Voice of Customer
                                </h3>
                                <p className="text-xs text-muted mb-3">Use these specific words in your copy to resonate deeper.</p>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.vocWords?.map((word, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-600 text-slate-300 rounded text-xs font-mono">
                                            "{word}"
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
       </div>
    </div>
  );
};
