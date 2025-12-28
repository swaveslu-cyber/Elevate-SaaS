import React, { useState } from 'react';
import { analyzeFanProfile, generateCommunityCampaign } from '../services/geminiService';
import { FanProfile } from '../types';

const MOCK_FANS: FanProfile[] = [
    { id: '1', name: 'Alice Chen', handle: '@alice_c', loyaltyScore: 98, joinDate: '2022-04-12', interactions: 452, tags: ['Super Fan', 'Buyer'], avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Chen&background=6366f1&color=fff' },
    { id: '2', name: 'Marcus Jo', handle: '@mj_dev', loyaltyScore: 85, joinDate: '2023-01-15', interactions: 120, tags: ['Engager'], avatarUrl: 'https://ui-avatars.com/api/?name=Marcus+Jo&background=10b981&color=fff' },
    { id: '3', name: 'Sarah Miller', handle: '@sarah_m', loyaltyScore: 72, joinDate: '2023-08-20', interactions: 45, tags: ['Newbie'], avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Miller&background=f43f5e&color=fff' },
    { id: '4', name: 'David Kim', handle: '@dk_pro', loyaltyScore: 92, joinDate: '2021-11-05', interactions: 310, tags: ['Ambassador'], avatarUrl: 'https://ui-avatars.com/api/?name=David+Kim&background=8b5cf6&color=fff' },
];

export const InnerCircle: React.FC = () => {
  const [selectedFan, setSelectedFan] = useState<FanProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [campaignDraft, setCampaignDraft] = useState('');

  const handleSelectFan = async (fan: FanProfile) => {
      setSelectedFan(fan);
      if (!fan.aiMemory) {
          setIsAnalyzing(true);
          const memory = await analyzeFanProfile(fan);
          // In a real app, we'd update the state array, but here we just update local view for simplicity
          fan.aiMemory = memory;
          setIsAnalyzing(false);
      }
  };

  const handleCreateCampaign = async () => {
      setIsDrafting(true);
      const topFans = MOCK_FANS.filter(f => f.loyaltyScore > 80);
      const draft = await generateCommunityCampaign("Top Tier Rewards", topFans);
      setCampaignDraft(draft);
      setIsDrafting(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Leaderboard Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"></div>
            <div className="relative z-10">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fa-solid fa-users-line text-amber-400"></i> The Inner Circle
                </h2>
                <p className="text-sm text-muted">Identify, track, and mobilize your most valuable community members.</p>
            </div>
            
            <div className="flex gap-3 relative z-10">
                <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-600 text-center">
                    <span className="block text-xs text-muted font-bold uppercase">Total Members</span>
                    <span className="font-mono text-lg text-white">12,450</span>
                </div>
                <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-600 text-center">
                    <span className="block text-xs text-muted font-bold uppercase">Active Today</span>
                    <span className="font-mono text-lg text-emerald-400">843</span>
                </div>
            </div>
       </div>

       <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Fan List */}
            <div className="w-full md:w-1/3 bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-white">Leaderboard</h3>
                    <button className="text-xs text-muted hover:text-white"><i className="fa-solid fa-filter"></i> Filter</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {MOCK_FANS.sort((a,b) => b.loyaltyScore - a.loyaltyScore).map((fan, i) => (
                        <div 
                            key={fan.id}
                            onClick={() => handleSelectFan(fan)}
                            className={`p-4 border-b border-slate-700 cursor-pointer transition-colors flex items-center gap-4 ${
                                selectedFan?.id === fan.id ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : 'hover:bg-slate-800/50'
                            }`}
                        >
                            <div className="font-bold text-lg text-slate-500 w-6 text-center">#{i+1}</div>
                            <img src={fan.avatarUrl} alt={fan.name} className="w-10 h-10 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-white truncate">{fan.name}</h4>
                                <p className="text-xs text-muted">{fan.handle}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold ${fan.loyaltyScore > 90 ? 'text-amber-400' : 'text-slate-400'}`}>
                                    {fan.loyaltyScore}
                                </span>
                                <div className="w-12 h-1 bg-slate-700 rounded-full mt-1">
                                    <div className="h-full bg-amber-500 rounded-full" style={{width: `${fan.loyaltyScore}%`}}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail / Action View */}
            <div className="flex-1 bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
                {!selectedFan ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="mb-8">
                            <i className="fa-solid fa-crown text-6xl text-slate-700 mb-4"></i>
                            <h3 className="text-xl font-bold text-white mb-2">Community Command</h3>
                            <p className="text-muted max-w-md mx-auto">Select a fan to view their AI dossier, or launch a mass campaign to your top tier.</p>
                        </div>
                        <button 
                            onClick={handleCreateCampaign}
                            disabled={isDrafting}
                            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 rounded-xl font-bold text-white shadow-xl transition-all disabled:opacity-50"
                        >
                            {isDrafting ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Drafting...</> : 'Launch "Super Fan" Campaign'}
                        </button>
                        
                        {campaignDraft && (
                            <div className="mt-8 w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-xl p-6 text-left animate-fade-in-up">
                                <h4 className="text-xs font-bold text-amber-500 uppercase mb-3">Draft Message</h4>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{campaignDraft}</p>
                                <div className="mt-4 flex justify-end gap-3">
                                    <button onClick={() => setCampaignDraft('')} className="text-xs text-muted hover:text-white">Discard</button>
                                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold">Send Blast</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        {/* Dossier Header */}
                        <div className="p-8 bg-gradient-to-br from-slate-900 to-amber-950/20 border-b border-slate-700 flex items-start gap-6">
                            <img src={selectedFan.avatarUrl} className="w-24 h-24 rounded-full border-4 border-surface shadow-2xl" />
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-white mb-1">{selectedFan.name}</h2>
                                <p className="text-muted text-sm mb-4">{selectedFan.handle} • Joined {selectedFan.joinDate}</p>
                                <div className="flex gap-2">
                                    {selectedFan.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">{selectedFan.interactions}</div>
                                <div className="text-xs text-muted uppercase tracking-wider font-bold">Interactions</div>
                            </div>
                        </div>

                        {/* Memory Core */}
                        <div className="p-8 flex-1 overflow-y-auto">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <i className="fa-solid fa-microchip text-6xl"></i>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <i className="fa-solid fa-brain text-purple-400"></i> AI Memory Core
                                </h3>
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-3 text-sm text-purple-300">
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> Analyzing history...
                                    </div>
                                ) : (
                                    <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                                        {selectedFan.aiMemory || "Analysis unavailable."}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors group">
                                    <i className="fa-solid fa-gift text-2xl text-pink-400 mb-2 group-hover:scale-110 transition-transform block"></i>
                                    <span className="font-bold text-white text-sm">Send Gift</span>
                                    <p className="text-xs text-muted mt-1">Reward loyalty with a perk.</p>
                                </button>
                                <button className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-colors group">
                                    <i className="fa-solid fa-envelope text-2xl text-indigo-400 mb-2 group-hover:scale-110 transition-transform block"></i>
                                    <span className="font-bold text-white text-sm">Direct Message</span>
                                    <p className="text-xs text-muted mt-1">Start a 1:1 conversation.</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};