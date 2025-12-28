import React, { useState } from 'react';
import { remasterContent } from '../services/geminiService';
import { PastPost, RemasterResult } from '../types';

const MOCK_HISTORY: PastPost[] = [
    { 
        id: 'p1', 
        date: 'Nov 12, 2021', 
        platform: 'linkedin',
        metrics: '14.2k Likes • 800 Comments',
        eraContext: 'The Great Resignation / Remote Work Boom',
        content: "I quit my job today. No backup plan. Just me and my laptop. It's scary, but staying in a toxic environment is scarier. #GreatResignation #Freedom"
    },
    { 
        id: 'p2', 
        date: 'Feb 4, 2018', 
        platform: 'twitter',
        metrics: '2.1k Retweets',
        eraContext: 'Pre-Thread Era / Short-form text',
        content: "Coding is 10% writing code and 90% Googling why it doesn't work. Change my mind."
    },
    { 
        id: 'p3', 
        date: 'Jun 20, 2019', 
        platform: 'instagram',
        metrics: '5.6k Likes',
        eraContext: 'Hustle Culture Peak',
        content: "Rise and Grind. While they sleep, we build. 😤💪 The only limit is your mindset. #Hustle #NoDaysOff #Entrepreneur"
    },
];

export const TimeCapsule: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<PastPost | null>(null);
  const [isRemastering, setIsRemastering] = useState(false);
  const [remaster, setRemaster] = useState<RemasterResult | null>(null);

  const handleSelect = (post: PastPost) => {
      setSelectedPost(post);
      setRemaster(null);
  };

  const handleRemaster = async () => {
      if (!selectedPost) return;
      setIsRemastering(true);
      const result = await remasterContent(selectedPost);
      setRemaster(result);
      setIsRemastering(false);
  };

  const getPlatformIcon = (platform: string) => {
      if (platform === 'linkedin') return 'fa-brands fa-linkedin text-blue-500';
      if (platform === 'twitter') return 'fa-brands fa-twitter text-blue-400';
      if (platform === 'instagram') return 'fa-brands fa-instagram text-pink-500';
      return 'fa-solid fa-share-nodes';
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
       
       {/* Left: The Vault */}
       <div className="lg:w-1/3 bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-clock-rotate-left text-amber-500"></i> The Vault
                </h2>
                <p className="text-sm text-muted">Select a past hit to recycle.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
                {MOCK_HISTORY.map(post => (
                    <div 
                        key={post.id}
                        onClick={() => handleSelect(post)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:translate-x-1 ${
                            selectedPost?.id === post.id 
                            ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30' 
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono text-amber-300/80 bg-amber-900/30 px-2 py-0.5 rounded border border-amber-900/50">
                                {post.date}
                            </span>
                            <i className={getPlatformIcon(post.platform)}></i>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-3 mb-3 italic">"{post.content}"</p>
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <i className="fa-solid fa-trophy text-yellow-500"></i>
                            {post.metrics}
                        </div>
                    </div>
                ))}
            </div>
       </div>

       {/* Right: The Studio */}
       <div className="flex-1 bg-surface rounded-xl border border-slate-700 flex flex-col relative overflow-hidden">
            {!selectedPost ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40">
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center mb-6">
                        <i className="fa-solid fa-hourglass-half text-4xl"></i>
                    </div>
                    <p className="text-lg font-bold">Select a memory to remaster.</p>
                </div>
            ) : (
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-900 to-amber-950/30">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Target Era:</span>
                                <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">Today (2025)</span>
                            </div>
                            <h3 className="font-bold text-white">Content Remastering Engine</h3>
                        </div>
                        <button 
                            onClick={handleRemaster}
                            disabled={isRemastering}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isRemastering ? <><i className="fa-solid fa-compact-disc fa-spin"></i> Processing...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> Remaster</>}
                        </button>
                    </div>

                    {/* Comparison Area */}
                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Original */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center block">Original ({selectedPost.date.split(',')[1]})</span>
                            <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl p-6 relative grayscale opacity-70 hover:opacity-100 transition-opacity">
                                <div className="absolute top-4 right-4 text-slate-600 text-4xl opacity-20">
                                    <i className="fa-solid fa-quote-left"></i>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-serif">
                                    {selectedPost.content}
                                </p>
                                <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500">
                                    <p className="font-bold mb-1">Context:</p>
                                    {selectedPost.eraContext}
                                </div>
                            </div>
                        </div>

                        {/* Remastered */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest text-center block">Remastered (2025)</span>
                            {!remaster ? (
                                <div className="flex-1 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-900/20">
                                    <p className="text-xs text-muted">Waiting for generation...</p>
                                </div>
                            ) : (
                                <div className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/30 rounded-xl p-6 relative animate-fade-in shadow-2xl">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full flex items-start justify-end p-3 text-amber-500">
                                        <i className="fa-solid fa-star"></i>
                                    </div>
                                    
                                    <p className="text-sm text-white leading-relaxed whitespace-pre-wrap mb-6">
                                        {remaster.modernContent}
                                    </p>

                                    <div className="space-y-3 bg-black/20 p-4 rounded-lg">
                                        <div className="text-xs">
                                            <span className="text-amber-400 font-bold uppercase mr-2">Strategy:</span>
                                            <span className="text-slate-300">{remaster.strategy}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {remaster.changes.map((change, i) => (
                                                <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                                                    {change}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button className="text-xs font-bold text-amber-500 hover:text-white transition-colors flex items-center gap-1">
                                            <i className="fa-regular fa-copy"></i> Copy Draft
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};