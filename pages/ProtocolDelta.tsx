
import React, { useState, useEffect } from 'react';
import { generateApprovalQueue } from '../services/geminiService';
import { ApprovalItem } from '../types';

export const ProtocolDelta: React.FC = () => {
    const [queue, setQueue] = useState<ApprovalItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [swipeDir, setSwipeDir] = useState<'left' | 'right' | 'none'>('none');
    const [stats, setStats] = useState({ approved: 0, rejected: 0 });

    const fetchQueue = async () => {
        setIsLoading(true);
        const dna = localStorage.getItem('elevate_brand_dna') || 'High performance tech content';
        const items = await generateApprovalQueue(dna);
        setQueue(items);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleAction = (action: 'approve' | 'reject' | 'refine') => {
        if (queue.length === 0) return;
        
        setSwipeDir(action === 'approve' ? 'right' : action === 'reject' ? 'left' : 'none');
        
        setTimeout(() => {
            if (action === 'approve') setStats(s => ({ ...s, approved: s.approved + 1 }));
            if (action === 'reject') setStats(s => ({ ...s, rejected: s.rejected + 1 }));
            
            setQueue(prev => prev.slice(1));
            setSwipeDir('none');
            
            if (queue.length <= 2) {
                // Pre-fetch more if getting low
                // fetchQueue(); 
            }
        }, 300);
    };

    const currentItem = queue[0];

    return (
        <div className="h-full flex flex-col gap-6 select-none animate-fade-in">
            {/* Header HUD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <i className="fa-solid fa-check-double text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Protocol Delta</h2>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Human Validator Engine</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Approved</p>
                        <p className="text-xl font-mono font-bold text-emerald-500">{stats.approved}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Queue</p>
                        <p className="text-xl font-mono font-bold text-indigo-400">{queue.length}</p>
                    </div>
                </div>
            </div>

            {/* Validation Arena */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <i className="fa-solid fa-layer-group text-6xl text-slate-800"></i>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Hydrating Queue...</p>
                    </div>
                ) : queue.length === 0 ? (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-dashed border-slate-800 flex items-center justify-center mx-auto text-slate-700">
                            <i className="fa-solid fa-inbox text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Queue Depleted</h3>
                        <button onClick={fetchQueue} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl">Refresh Signal</button>
                    </div>
                ) : (
                    <div className="w-full max-w-xl h-full flex flex-col items-center justify-center relative">
                        {/* Background Cards Stack */}
                        <div className="absolute w-[90%] h-[400px] bg-slate-900/40 border border-slate-800 rounded-[40px] transform translate-y-8 scale-95 opacity-50 -z-10"></div>
                        <div className="absolute w-[95%] h-[400px] bg-slate-900/60 border border-slate-800 rounded-[40px] transform translate-y-4 scale-[0.97] opacity-80 -z-10"></div>

                        {/* Current Card */}
                        <div className={`w-full bg-slate-900 border-2 border-slate-800 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 transform
                            ${swipeDir === 'right' ? 'translate-x-[200px] rotate-12 opacity-0' : ''}
                            ${swipeDir === 'left' ? 'translate-x-[-200px] -rotate-12 opacity-0' : ''}
                        `}>
                            {/* Card Content */}
                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg">
                                            <i className={`fa-brands ${currentItem.channel.toLowerCase().includes('twitter') ? 'fa-twitter' : 'fa-linkedin'}`}></i>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-widest">{currentItem.type}</p>
                                            <p className="text-[9px] text-slate-500 font-mono">{currentItem.channel}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence</p>
                                        <p className="text-xl font-mono font-bold text-emerald-500">{currentItem.aiConfidence}%</p>
                                    </div>
                                </div>

                                {currentItem.headline && (
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">
                                        {currentItem.headline}
                                    </h3>
                                )}

                                <p className="text-lg text-slate-300 font-medium leading-relaxed mb-8">
                                    {currentItem.content}
                                </p>

                                <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">AI Rationale</h4>
                                    <p className="text-xs text-slate-400 italic leading-relaxed">"{currentItem.rationale}"</p>
                                </div>
                            </div>

                            {/* Card Actions Footer */}
                            <div className="p-8 border-t border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                                <button 
                                    onClick={() => handleAction('reject')}
                                    className="w-16 h-16 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform active:scale-90"
                                >
                                    <i className="fa-solid fa-xmark text-xl"></i>
                                </button>
                                
                                <button 
                                    onClick={() => handleAction('refine')}
                                    className="px-8 py-4 border border-slate-700 bg-slate-800 text-slate-300 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-700 transition-all active:scale-95"
                                >
                                    Refine Output
                                </button>

                                <button 
                                    onClick={() => handleAction('approve')}
                                    className="w-16 h-16 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all transform active:scale-90"
                                >
                                    <i className="fa-solid fa-check text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
