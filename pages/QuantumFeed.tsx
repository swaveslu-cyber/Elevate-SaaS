import React, { useState } from 'react';
import { generateQuantumTimelines } from '../services/geminiService';
import { QuantumTimeline, QuantumPost } from '../types';

export const QuantumFeed: React.FC = () => {
  const [timelines, setTimelines] = useState<QuantumTimeline[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<QuantumPost | null>(null);

  const handleGenerate = async () => {
      setIsGenerating(true);
      const data = await generateQuantumTimelines();
      setTimelines(data);
      setIsGenerating(false);
  };

  const getFormatIcon = (format: string) => {
      const f = format.toLowerCase();
      if (f.includes('tweet') || f.includes('thread')) return 'fa-brands fa-twitter';
      if (f.includes('reel') || f.includes('video')) return 'fa-solid fa-video';
      if (f.includes('post') || f.includes('image')) return 'fa-regular fa-image';
      return 'fa-solid fa-note-sticky';
  };

  return (
    <div className="h-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-end bg-surface rounded-xl border border-slate-700 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 pointer-events-none"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-black text-white flex items-center gap-2 tracking-tight">
                    <i className="fa-solid fa-atom text-cyan-400 animate-spin-slow"></i>
                    THE QUANTUM FEED
                </h2>
                <p className="text-sm text-cyan-200/70 font-mono mt-1">Probabilistic Content Engine // Multiverse Simulation</p>
            </div>
            <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="relative z-10 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2 group"
            >
                {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bolt group-hover:animate-pulse"></i>}
                {isGenerating ? 'Collapsing Wave Functions...' : 'Generate Futures'}
            </button>
        </div>

        {/* Timelines Container */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
            {!timelines.length && !isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-timeline text-8xl mb-6"></i>
                    <p className="text-lg font-mono">Awaiting Quantum Event</p>
                </div>
            ) : (
                <div className="flex h-full gap-6 min-w-[1000px] px-1">
                    {/* Skeleton Loading */}
                    {isGenerating && [1, 2, 3].map(i => (
                        <div key={i} className="flex-1 bg-surface border border-slate-700 rounded-xl p-4 animate-pulse flex flex-col gap-4 opacity-50">
                            <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                            <div className="h-32 bg-slate-800 rounded"></div>
                            <div className="h-32 bg-slate-800 rounded"></div>
                            <div className="h-32 bg-slate-800 rounded"></div>
                        </div>
                    ))}

                    {/* Active Timelines */}
                    {!isGenerating && timelines.map((timeline) => (
                        <div key={timeline.name} className={`flex-1 flex flex-col bg-slate-900/50 border rounded-xl overflow-hidden backdrop-blur-sm transition-all hover:bg-slate-900/80 ${
                            timeline.color === 'cyan' ? 'border-cyan-500/30' : 
                            timeline.color === 'emerald' ? 'border-emerald-500/30' : 
                            'border-purple-500/30'
                        }`}>
                            {/* Timeline Header */}
                            <div className={`p-4 border-b ${
                                timeline.color === 'cyan' ? 'bg-cyan-950/50 border-cyan-500/30 text-cyan-400' :
                                timeline.color === 'emerald' ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400' :
                                'bg-purple-950/50 border-purple-500/30 text-purple-400'
                            }`}>
                                <h3 className="font-bold text-lg uppercase tracking-widest">{timeline.name}</h3>
                                <p className="text-xs text-white/70 font-medium">{timeline.archetype}</p>
                            </div>

                            {/* Posts Feed */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {timeline.posts.map((post) => (
                                    <div 
                                        key={post.id}
                                        onClick={() => setSelectedPost(post)}
                                        className="bg-slate-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-white/30 transition-all hover:-translate-y-1 shadow-lg group relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-1 h-full ${
                                            timeline.color === 'cyan' ? 'bg-cyan-500' : 
                                            timeline.color === 'emerald' ? 'bg-emerald-500' : 
                                            'bg-purple-500'
                                        }`}></div>
                                        
                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-black/30 px-2 py-0.5 rounded">
                                                <i className={`${getFormatIcon(post.format)} mr-1`}></i> {post.format}
                                            </span>
                                            <i className="fa-solid fa-expand text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </div>
                                        
                                        <h4 className="text-sm font-bold text-white mb-2 pl-2 line-clamp-2">{post.headline}</h4>
                                        <p className="text-xs text-slate-400 pl-2 line-clamp-3 mb-3">{post.hook}</p>
                                        
                                        <div className="pl-2 pt-2 border-t border-slate-700/50 flex items-center gap-2">
                                            <i className="fa-solid fa-crystal-ball text-xs text-slate-500"></i>
                                            <span className="text-[10px] text-slate-300 font-mono">{post.prediction}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Post Detail Modal */}
        {selectedPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedPost(null)}>
                <div 
                    className="w-full max-w-2xl bg-surface border border-slate-600 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-900/50 rounded-t-2xl">
                        <div>
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1 block">Quantum Artifact</span>
                            <h2 className="text-2xl font-bold text-white leading-tight">{selectedPost.headline}</h2>
                        </div>
                        <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-white transition-colors">
                            <i className="fa-solid fa-xmark text-2xl"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">The Hook</h4>
                            <p className="text-lg font-medium text-white">{selectedPost.hook}</p>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Content Body</h4>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
                        </div>

                        <div className="flex items-center gap-3 bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">AI Prediction</h4>
                                <p className="text-xs text-cyan-200">{selectedPost.prediction}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
                        <button 
                            onClick={() => setSelectedPost(null)}
                            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                        >
                            Discard
                        </button>
                        <button 
                            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                        >
                            <i className="fa-solid fa-cube"></i>
                            Materialize to Studio
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};