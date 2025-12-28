
import React, { useState, useEffect } from 'react';
import { initiateAlphaDrafting } from '../services/geminiService';
import { SigmaNiche, AlphaCampaign } from '../types';

interface ProtocolAlphaProps {
    activeNiche: SigmaNiche | null;
}

export const ProtocolAlpha: React.FC<ProtocolAlphaProps> = ({ activeNiche }) => {
    const [isDrafting, setIsDrafting] = useState(false);
    const [campaign, setCampaign] = useState<AlphaCampaign | null>(null);
    const [draftLogs, setDraftLogs] = useState<string[]>([]);
    const [agentProgress, setAgentProgress] = useState({ scribe: 0, director: 0, syndicate: 0 });

    useEffect(() => {
        if (activeNiche && !campaign && !isDrafting) {
            startDrafting();
        }
    }, [activeNiche]);

    const startDrafting = async () => {
        if (!activeNiche) return;
        setIsDrafting(true);
        setCampaign(null);
        setDraftLogs([`> PROTOCOL_ALPHA_INITIALIZED`, `> TARGETING_NICHE: ${activeNiche.title.toUpperCase()}`]);
        
        // Simulated agent sequences
        const sequences = [
            { agent: 'scribe', log: "SCRIBE_AI: Drafting multi-channel copy blocks...", p: 30 },
            { agent: 'director', log: "DIRECTOR_AI: Rendering visual concepts and storyboards...", p: 60 },
            { agent: 'syndicate', log: "SYNDICATE: Organizing task vectors and ROI forecasts...", p: 90 }
        ];

        for (const seq of sequences) {
            await new Promise(r => setTimeout(r, 1500));
            setDraftLogs(prev => [`> ${seq.log}`, ...prev]);
            setAgentProgress(prev => ({ ...prev, [seq.agent]: 100 }));
        }

        const dna = localStorage.getItem('elevate_brand_dna') || 'High growth AI and content production';
        const result = await initiateAlphaDrafting(activeNiche, dna);
        
        setCampaign(result);
        setDraftLogs(prev => [`> AUTO_DRAFT_COMPLETE: CAMPAIGN_STABLE`, ...prev]);
        setIsDrafting(false);
    };

    if (!activeNiche) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-900 border border-slate-800 rounded-3xl opacity-60 border-dashed">
                <i className="fa-solid fa-wand-magic-sparkles text-6xl mb-6 text-slate-700"></i>
                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">Protocol Alpha: Idle</h2>
                <p className="text-slate-500 max-w-sm">Promote a finding from Protocol Sigma to initialize the autonomous drafting sequence.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in no-select">
            
            {/* Header: The Drafting Room */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-3xl shadow-lg ${isDrafting ? 'animate-pulse' : ''}`}>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Active Sequence</span>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{activeNiche.title}</h2>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {['Scribe', 'Director', 'Syndicate'].map((agent, idx) => (
                            <div key={agent} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-w-[120px]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{agent}</span>
                                    <span className="text-[9px] font-mono text-indigo-400">{agentProgress[agent.toLowerCase() as keyof typeof agentProgress]}%</span>
                                </div>
                                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-indigo-500 transition-all duration-1000 ${isDrafting ? 'animate-pulse' : ''}`}
                                        style={{ width: `${agentProgress[agent.toLowerCase() as keyof typeof agentProgress]}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                
                {/* Left: Terminal Log (Col 3) */}
                <div className="lg:col-span-3 bg-black border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-slate-900/30">
                        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Draft_Sequence_Log</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 custom-scrollbar bg-slate-950/50">
                        {draftLogs.map((log, i) => (
                            <div key={i} className="flex gap-3 opacity-80 animate-fade-in-right">
                                <span className="text-slate-700 shrink-0">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                <span className={log.includes('COMPLETE') ? 'text-indigo-400' : 'text-slate-400'}>{log}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: The Draft Manifest (Col 9) */}
                <div className="lg:col-span-9 flex flex-col gap-6 overflow-hidden">
                    {!campaign ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-3xl opacity-40">
                            <i className="fa-solid fa-brain fa-spin text-4xl mb-4"></i>
                            <p className="text-xs font-black uppercase tracking-widest">Agents working at high-frequency...</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            
                            {/* Strategy Card */}
                            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <i className="fa-solid fa-chess text-8xl"></i>
                                </div>
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Tactical Offensive Strategy</h3>
                                <p className="text-lg text-white font-bold leading-relaxed mb-6 italic">"{campaign.strategy}"</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {campaign.tasks?.map((task, i) => (
                                        <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[10px] text-slate-400 font-mono">
                                            <i className="fa-solid fa-check text-indigo-500 mr-2"></i>
                                            {task.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Channel Grids */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Twitter Thread */}
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                            <i className="fa-brands fa-twitter"></i> Twitter Thread
                                        </h4>
                                        <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase">Copy All</button>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        {campaign.channels?.twitter?.thread?.map((tweet, i) => (
                                            <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 leading-relaxed group relative">
                                                <span className="absolute -left-2 -top-2 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</span>
                                                {tweet}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* LinkedIn / Insight */}
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                            <i className="fa-brands fa-linkedin"></i> Authority Post
                                        </h4>
                                        <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase">Copy</button>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-sm text-slate-200 leading-relaxed mb-6">
                                        {campaign.channels?.linkedin?.post}
                                    </div>
                                    <div className="space-y-2">
                                        <h5 className="text-[9px] font-black text-slate-500 uppercase">Key Value Anchors</h5>
                                        {campaign.channels?.linkedin?.keyInsights?.map((insight, i) => (
                                            <div key={i} className="text-xs text-indigo-300 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                {insight}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Video Direction */}
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all">
                                    <h4 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                        <i className="fa-solid fa-clapperboard"></i> Video Manifest
                                    </h4>
                                    <div className="bg-black/40 border border-slate-800 p-4 rounded-2xl mb-4">
                                        <span className="text-[9px] font-black text-slate-600 uppercase mb-2 block">The Viral Hook</span>
                                        <p className="text-sm font-bold text-white italic">"{campaign.channels?.video?.hook}"</p>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                        <span className="text-[9px] font-black text-slate-600 uppercase mb-2 block">Storyboard Prompt</span>
                                        <p className="text-xs text-slate-400 font-mono leading-relaxed">{campaign.channels?.video?.storyboardPrompt}</p>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500">VIBE: <span className="text-indigo-400">{campaign.channels?.video?.vibe}</span></span>
                                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest">Send to Director</button>
                                    </div>
                                </div>

                                {/* Ad Creative */}
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all flex flex-col">
                                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                        <i className="fa-solid fa-bolt"></i> Performance Ad
                                    </h4>
                                    <div className="space-y-4 flex-1">
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                            <span className="text-[9px] font-black text-slate-600 uppercase mb-1 block">Headline</span>
                                            <p className="text-sm font-bold text-white">{campaign.channels?.ads?.headline}</p>
                                        </div>
                                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                            <span className="text-[9px] font-black text-slate-600 uppercase mb-1 block">Body Copy</span>
                                            <p className="text-xs text-slate-400 leading-relaxed">{campaign.channels?.ads?.body}</p>
                                        </div>
                                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl">
                                            <span className="text-[9px] font-black text-emerald-500 uppercase mb-1 block">Visual Concept</span>
                                            <p className="text-xs text-emerald-100">{campaign.channels?.ads?.visualConcept}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Massive Launch Button */}
                            <div className="bg-indigo-600 border border-indigo-400 p-8 rounded-3xl shadow-2xl text-center group cursor-pointer hover:bg-indigo-500 transition-all active:scale-95">
                                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Initialize Offensive</h3>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.3em]">Deploy all assets to scheduler</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
