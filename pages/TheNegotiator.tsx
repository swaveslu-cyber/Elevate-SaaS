import React, { useState } from 'react';
import { generateNegotiationPlan } from '../services/geminiService';
import { NegotiationPlan } from '../types';

const ARCHETYPES = [
    { id: 'The Voss', label: 'The Voss (FBI Empathy)', desc: 'Mirroring & Labeling', color: 'text-emerald-400 border-emerald-500/50' },
    { id: 'The Challenger', label: 'The Challenger', desc: 'Assertive Teaching', color: 'text-red-400 border-red-500/50' },
    { id: 'The Stoic', label: 'The Stoic', desc: 'Logic & Detachment', color: 'text-blue-300 border-blue-500/50' },
    { id: 'The Bridge', label: 'The Bridge', desc: 'Win-Win Collaboration', color: 'text-amber-400 border-amber-500/50' },
];

export const TheNegotiator: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [archetype, setArchetype] = useState(ARCHETYPES[0].id);
  const [plan, setPlan] = useState<NegotiationPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  const handleNegotiate = async () => {
      if (!situation) return;
      setIsPlanning(true);
      setPlan(null);
      const result = await generateNegotiationPlan(situation, archetype);
      setPlan(result);
      setIsPlanning(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
        
        {/* Input / Strategy Room */}
        <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] opacity-10 pointer-events-none"></div>
            
            {/* Left: Input */}
            <div className="flex-1 flex flex-col gap-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-white shadow-inner">
                        <i className="fa-solid fa-handshake-simple"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Negotiator</h2>
                        <p className="text-xs text-muted">High-Stakes Deal Architect</p>
                    </div>
                </div>

                <textarea 
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="Describe the standoff (e.g. 'Client is ghosting after proposal', 'Supplier raised prices by 20%')..."
                    className="flex-1 min-h-[120px] bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm focus:border-white outline-none resize-none shadow-inner"
                />
            </div>

            {/* Right: Archetype Selection */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 relative z-10">
                <label className="text-xs font-bold uppercase text-muted tracking-widest">Select Strategy</label>
                <div className="grid grid-cols-1 gap-2">
                    {ARCHETYPES.map(arch => (
                        <button
                            key={arch.id}
                            onClick={() => setArchetype(arch.id)}
                            className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between group ${
                                archetype === arch.id 
                                ? `bg-slate-800 ${arch.color} shadow-lg` 
                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <div>
                                <span className="block text-sm font-bold">{arch.label}</span>
                                <span className="block text-[10px] opacity-70">{arch.desc}</span>
                            </div>
                            {archetype === arch.id && <i className="fa-solid fa-check"></i>}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={handleNegotiate}
                    disabled={isPlanning || !situation}
                    className="w-full py-3 bg-white text-black hover:bg-slate-200 rounded-lg font-bold shadow-xl transition-all disabled:opacity-50"
                >
                    {isPlanning ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Architect Deal'}
                </button>
            </div>
        </div>

        {/* Results: The Playbook */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative">
            {!plan ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-30">
                    <i className="fa-solid fa-chess-knight text-6xl mb-4"></i>
                    <p className="text-lg">Waiting for tactical input.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Active Strategy</span>
                            <h3 className="text-xl font-bold text-white">{plan.strategy}</h3>
                        </div>
                        <div className="text-right max-w-md">
                            <p className="text-xs text-slate-400 italic">"{plan.summary}"</p>
                        </div>
                    </div>

                    {/* Tactics Feed */}
                    <div className="flex-1 p-8 space-y-8">
                        {plan.tactics.map((tactic, idx) => (
                            <div key={idx} className="flex gap-6 animate-fade-in-up" style={{animationDelay: `${idx * 150}ms`}}>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                                        {idx + 1}
                                    </div>
                                    {idx < plan.tactics.length - 1 && <div className="w-0.5 flex-1 bg-slate-800 my-2"></div>}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-slate-300 uppercase mb-2 tracking-wide">{tactic.stepName}</h4>
                                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-sm relative group hover:border-slate-500 transition-colors">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(tactic.script)}
                                                className="text-xs text-white bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <p className="text-base text-white font-medium leading-relaxed mb-3">"{tactic.script}"</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-black/20 p-2 rounded w-fit">
                                            <i className="fa-solid fa-brain"></i>
                                            {tactic.rationale}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Closer */}
                        <div className="mt-8 pt-8 border-t border-slate-800">
                            <h4 className="text-center text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">The Closer</h4>
                            <div className="max-w-2xl mx-auto bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-xl text-center">
                                <p className="text-lg text-emerald-100 font-serif italic">"{plan.closingLine}"</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};