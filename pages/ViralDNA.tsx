import React, { useState } from 'react';
import { extractViralDNA, mutateContent } from '../services/geminiService';
import { ViralStructure, MutatedPost } from '../types';

export const ViralDNA: React.FC = () => {
  // Input State
  const [sourceContent, setSourceContent] = useState('');
  const [targetTopic, setTargetTopic] = useState('');
  
  // Processing State
  const [isExtracting, setIsExtracting] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  
  // Results State
  const [dna, setDna] = useState<ViralStructure | null>(null);
  const [mutations, setMutations] = useState<MutatedPost[]>([]);

  const handleExtract = async () => {
      if (!sourceContent) return;
      setIsExtracting(true);
      setDna(null);
      setMutations([]);
      const result = await extractViralDNA(sourceContent);
      setDna(result);
      setIsExtracting(false);
  };

  const handleMutate = async () => {
      if (!dna || !targetTopic) return;
      setIsMutating(true);
      setMutations([]);
      const results = await mutateContent(dna, targetTopic);
      setMutations(results);
      setIsMutating(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       <div className="bg-surface rounded-xl border border-slate-700 p-8 relative overflow-hidden flex flex-col items-center">
            {/* Background DNA Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 to-cyan-900/10"></div>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'repeating-linear-gradient(45deg, #10b981 0, #10b981 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px'}}></div>
            
            <div className="relative z-10 w-full max-w-4xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
                        <i className="fa-solid fa-dna text-emerald-400"></i> Viral DNA Decoder
                    </h2>
                    <p className="text-muted">Reverse engineer successful content and replicate its structure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Source Input */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Step 1: The Source</label>
                            <span className="text-[10px] text-muted">Paste a viral post here</span>
                        </div>
                        <textarea 
                            value={sourceContent}
                            onChange={(e) => setSourceContent(e.target.value)}
                            placeholder="Paste the text of a successful post (LinkedIn, Twitter, etc.)..."
                            className="w-full h-32 bg-slate-900/80 border border-slate-600 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none resize-none shadow-inner transition-all"
                        />
                        <button 
                            onClick={handleExtract}
                            disabled={isExtracting || !sourceContent}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                        >
                            {isExtracting ? <><i className="fa-solid fa-microscope fa-bounce mr-2"></i> Analyzing Structure...</> : 'Extract DNA'}
                        </button>
                    </div>

                    {/* DNA Visualization */}
                    <div className={`bg-slate-900/50 border border-slate-700 rounded-xl p-6 relative ${!dna ? 'flex items-center justify-center' : ''}`}>
                        {!dna ? (
                            <div className="text-center text-muted opacity-50">
                                <i className="fa-solid fa-chart-network text-4xl mb-3"></i>
                                <p className="text-xs">Structure analysis will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <h4 className="text-[10px] font-bold text-muted uppercase mb-1">Hook Type</h4>
                                    <span className="text-sm font-bold text-white bg-emerald-500/10 px-2 py-1 rounded text-emerald-400 border border-emerald-500/20">{dna.hookType}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-muted uppercase mb-1">Emotion</h4>
                                        <span className="text-xs text-slate-200">{dna.emotionalTrigger}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-muted uppercase mb-1">Tone</h4>
                                        <span className="text-xs text-slate-200">{dna.tone}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-muted uppercase mb-2">Structural Genome</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {dna.structure.map((beat, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-600">{beat}</span>
                                                {i < dna.structure.length - 1 && <i className="fa-solid fa-arrow-right text-[10px] text-muted"></i>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
       </div>

       {/* Mutation Section (Only visible if DNA extracted) */}
       {dna && (
           <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col animate-fade-in-up">
                <div className="p-6 border-b border-slate-700 bg-slate-900/30 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold uppercase text-cyan-400 tracking-wider mb-2 block">Step 2: Mutation Target</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={targetTopic}
                                onChange={(e) => setTargetTopic(e.target.value)}
                                placeholder="Enter YOUR topic (e.g. 'Launching a SaaS product', 'Why coffee is good')..."
                                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg py-2.5 px-4 text-sm focus:border-cyan-500 outline-none"
                            />
                            <button 
                                onClick={handleMutate}
                                disabled={isMutating || !targetTopic}
                                className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                            >
                                {isMutating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Replicate'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-900/10">
                    {!mutations.length ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                            <i className="fa-solid fa-flask text-4xl mb-3"></i>
                            <p className="text-sm">Ready to mutate viral structure into new content.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {mutations.map((post, idx) => (
                                <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/30 transition-all group flex flex-col">
                                    <h3 className="font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{post.title}</h3>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed mb-4 flex-1">{post.content}</p>
                                    
                                    <div className="bg-cyan-900/10 border border-cyan-900/30 p-3 rounded-lg mb-4">
                                        <p className="text-[10px] text-cyan-300 italic">"{post.explanation}"</p>
                                    </div>

                                    <button className="w-full py-2 bg-slate-700 hover:bg-cyan-600 hover:text-white rounded-lg text-xs font-bold text-muted transition-colors">
                                        Copy Draft
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
           </div>
       )}
    </div>
  );
};