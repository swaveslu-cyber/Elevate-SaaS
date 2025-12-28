import React, { useState } from 'react';
import { generateGrowthExperiments } from '../services/geminiService';
import { GrowthExperiment } from '../types';

export const TheCatalyst: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [constraints, setConstraints] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [experiments, setExperiments] = useState<GrowthExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<GrowthExperiment | null>(null);

  const handleSynthesize = async () => {
      if (!goal) return;
      setIsSynthesizing(true);
      setExperiments([]);
      setSelectedExperiment(null);
      const results = await generateGrowthExperiments(goal, constraints || 'No specific constraints');
      setExperiments(results);
      setIsSynthesizing(false);
  };

  const getScoreColor = (score: number) => {
      if (score >= 8) return 'text-emerald-400';
      if (score >= 6) return 'text-amber-400';
      return 'text-slate-400';
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Lab Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-lime-900/10 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-64 h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10 pointer-events-none"></div>

            <div className="relative z-10 w-full md:w-1/3">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-2 tracking-tight">
                    <i className="fa-solid fa-flask-vial text-lime-400 animate-pulse-slow"></i> THE CATALYST
                </h2>
                <p className="text-sm text-lime-100/70 font-mono mb-6">Growth Hacking Experiment Engine</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-lime-500 uppercase tracking-wider block mb-1">North Star Metric</label>
                        <input 
                            type="text" 
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g. 'Get first 1,000 paid users'"
                            className="w-full bg-slate-950 border border-slate-600 rounded-lg p-3 text-sm focus:border-lime-500 outline-none text-white shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-cyan-500 uppercase tracking-wider block mb-1">Constraints (Budget, Time)</label>
                        <input 
                            type="text" 
                            value={constraints}
                            onChange={(e) => setConstraints(e.target.value)}
                            placeholder="e.g. '$0 budget, 1 week sprint'"
                            className="w-full bg-slate-950 border border-slate-600 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none text-white shadow-inner"
                        />
                    </div>
                    <button 
                        onClick={handleSynthesize}
                        disabled={isSynthesizing || !goal}
                        className="w-full py-3 bg-gradient-to-r from-lime-600 to-cyan-600 hover:opacity-90 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                    >
                        {isSynthesizing ? <i className="fa-solid fa-atom fa-spin"></i> : 'Synthesize Experiments'}
                    </button>
                </div>
            </div>

            {/* Experiment Grid */}
            <div className="relative z-10 flex-1 w-full h-full min-h-[300px] overflow-y-auto">
                {!experiments.length ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted opacity-40">
                        <i className="fa-solid fa-vial-virus text-6xl mb-4"></i>
                        <p className="font-mono text-sm">Waiting for chemical reaction...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {experiments.map((exp) => (
                            <div 
                                key={exp.id}
                                onClick={() => setSelectedExperiment(exp)}
                                className={`p-5 rounded-xl border cursor-pointer transition-all hover:-translate-y-1 group relative overflow-hidden ${
                                    selectedExperiment?.id === exp.id 
                                    ? 'bg-lime-900/20 border-lime-500 shadow-lg shadow-lime-900/20' 
                                    : 'bg-surface border-slate-700 hover:border-slate-500'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-slate-900 rounded-lg px-2 py-1 border border-slate-700 text-xs font-mono font-bold text-white">
                                        ICE: <span className={getScoreColor(exp.iceScore.total)}>{exp.iceScore.total}</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-white mb-2 leading-tight group-hover:text-lime-300 transition-colors">{exp.title}</h3>
                                <p className="text-xs text-slate-400 line-clamp-2">{exp.hypothesis}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
       </div>

       {/* Detailed Protocol */}
       {selectedExperiment && (
           <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col relative animate-fade-in-up">
               <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                   <div>
                       <h3 className="text-xl font-bold text-white">{selectedExperiment.title}</h3>
                       <p className="text-sm text-slate-400 font-mono mt-1">Experiment Protocol #{selectedExperiment.id.split('-')[1]}</p>
                   </div>
                   <div className="flex gap-4">
                       <div className="text-center">
                           <span className="text-[10px] uppercase text-muted font-bold block">Impact</span>
                           <span className="font-mono font-bold text-lime-400">{selectedExperiment.iceScore.impact}</span>
                       </div>
                       <div className="text-center">
                           <span className="text-[10px] uppercase text-muted font-bold block">Confidence</span>
                           <span className="font-mono font-bold text-cyan-400">{selectedExperiment.iceScore.confidence}</span>
                       </div>
                       <div className="text-center">
                           <span className="text-[10px] uppercase text-muted font-bold block">Ease</span>
                           <span className="font-mono font-bold text-white">{selectedExperiment.iceScore.ease}</span>
                       </div>
                   </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                       <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                           <h4 className="text-xs font-bold text-lime-500 uppercase tracking-wider mb-2">The Hypothesis</h4>
                           <p className="text-sm text-slate-200 leading-relaxed italic">"{selectedExperiment.hypothesis}"</p>
                       </div>

                       <div>
                           <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Execution Method</h4>
                           <div className="space-y-4">
                               {selectedExperiment.method.map((step, i) => (
                                   <div key={i} className="flex gap-4">
                                       <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-white">
                                           {i + 1}
                                       </div>
                                       <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>

                   <div className="space-y-6">
                       <div className="bg-cyan-900/10 border border-cyan-500/20 p-5 rounded-xl">
                           <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Success Metrics</h4>
                           <ul className="space-y-2">
                               {selectedExperiment.metrics.map((metric, i) => (
                                   <li key={i} className="flex items-center gap-2 text-sm text-cyan-100">
                                       <i className="fa-solid fa-chart-line text-cyan-500 text-xs"></i>
                                       {metric}
                                   </li>
                               ))}
                           </ul>
                       </div>
                       
                       <div className="bg-slate-900 p-6 rounded-xl text-center border border-slate-800">
                           <p className="text-xs text-muted mb-4">Ready to launch this experiment?</p>
                           <button className="px-6 py-2 bg-lime-600 hover:bg-lime-500 text-black font-bold rounded-full text-sm transition-colors shadow-lg">
                               Add to Roadmap
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};