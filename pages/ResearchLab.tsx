import React, { useState, useEffect } from 'react';
import { generateDeepResearch } from '../services/geminiService';

export const ResearchLab: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [thoughtDepth, setThoughtDepth] = useState(50); // Slider 1-100
  const [report, setReport] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  
  // Calculate token budget based on slider
  // Range: 1024 (Fast) to 16000 (Deep)
  const budget = Math.floor(1024 + (thoughtDepth / 100) * (16000 - 1024));

  const handleResearch = async () => {
    if (!topic) return;
    setIsThinking(true);
    setReport(null);
    
    const result = await generateDeepResearch(topic, budget);
    setReport(result);
    setIsThinking(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       <div className="bg-surface rounded-xl border border-slate-700 p-8 flex flex-col items-center relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/30 to-blue-950/30"></div>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
            
            <div className="relative z-10 w-full max-w-3xl text-center">
                <h2 className="text-3xl font-bold mb-2 text-white">Research Lab</h2>
                <p className="text-indigo-200 mb-8">Deploy Gemini 3.0's reasoning engine for deep strategic analysis.</p>

                <div className="space-y-6">
                    <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Define your research objective (e.g. 'Analyze the impact of Generative AI on the SaaS CRM market in 2025')..."
                        className="w-full bg-slate-900/80 border border-slate-600 rounded-xl p-4 text-base focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none shadow-xl resize-none h-32 transition-all"
                    />

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                            <span>Processing Depth</span>
                            <span className="text-indigo-400">{budget} Reasoning Tokens</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" max="100" 
                            value={thoughtDepth}
                            onChange={(e) => setThoughtDepth(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Quick Audit</span>
                            <span>Deep Strategy</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleResearch}
                        disabled={isThinking || !topic}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isThinking ? (
                            <>
                                <i className="fa-solid fa-brain fa-beat"></i>
                                Reasoning...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-flask"></i>
                                Initiate Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>
       </div>

       <div className="flex-1 bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col relative">
            {isThinking && (
                <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                             <i className="fa-solid fa-microchip text-3xl text-indigo-400"></i>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">The Neural Core is Thinking</h3>
                    <p className="text-indigo-200 text-sm max-w-md text-center">
                        Allocating {budget} tokens to structure your report. 
                        Complex reasoning takes time.
                    </p>
                </div>
            )}

            {!report && !isThinking ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-file-contract text-6xl mb-4"></i>
                    <p>Research output will appear here.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto bg-slate-50 p-10 rounded-xl text-slate-900 shadow-2xl min-h-full">
                         {/* Header Branding for the Report */}
                         <div className="flex justify-between items-center border-b border-slate-200 pb-6 mb-8">
                             <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
                                     <i className="fa-solid fa-layer-group text-white text-xs"></i>
                                 </div>
                                 <span className="font-bold text-xl tracking-tight text-slate-900">Elevate Intelligence</span>
                             </div>
                             <div className="text-right">
                                 <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">Strategic Report</div>
                                 <div className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString()}</div>
                             </div>
                         </div>
                         
                         {/* Markdown Content (Rendered as pre-wrap text for simplicity, usually needs a Markdown parser) */}
                         <div className="prose max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
                             {report}
                         </div>

                         <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-mono">
                             Generated by Elevate OS • Gemini 3.0 Pro Reasoning Engine
                         </div>
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};