import React, { useState } from 'react';
import { repurposeContent } from '../services/geminiService';
import { MultiplierResult } from '../types';

const TARGET_PLATFORMS = [
    { id: 'twitter', label: 'Twitter Thread', icon: 'fa-twitter' },
    { id: 'linkedin', label: 'LinkedIn Post', icon: 'fa-linkedin' },
    { id: 'instagram', label: 'Instagram Caption', icon: 'fa-instagram' },
    { id: 'tiktok', label: 'TikTok/Reel Script', icon: 'fa-tiktok' },
    { id: 'newsletter', label: 'Newsletter', icon: 'fa-envelope' },
];

export const Multiplier: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MultiplierResult | null>(null);

  const toggleTarget = (id: string) => {
      setSelectedTargets(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
      if (!sourceText || selectedTargets.length === 0) return;
      setIsGenerating(true);
      setResult(null);
      const data = await repurposeContent(sourceText, selectedTargets);
      setResult(data);
      setIsGenerating(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       {/* Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                <i className="fa-solid fa-arrows-split-up-and-left text-primary"></i> Content Multiplier
            </h2>
            <p className="text-sm text-muted mb-6">Turn one piece of hero content into a full social media campaign.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-2">1. Source Material</label>
                    <textarea 
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Paste your blog post, video transcript, or whitepaper content here..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm focus:border-primary outline-none resize-none h-48"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-2">2. Target Channels</label>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {TARGET_PLATFORMS.map(platform => (
                            <button 
                                key={platform.id}
                                onClick={() => toggleTarget(platform.id)}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-3 ${
                                    selectedTargets.includes(platform.id) 
                                    ? 'bg-primary/20 border-primary text-white' 
                                    : 'bg-slate-800/50 border-slate-700 text-muted hover:bg-slate-800'
                                }`}
                            >
                                <i className={`fa-brands ${platform.icon}`}></i>
                                {platform.label}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !sourceText || selectedTargets.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-lg font-bold text-white shadow-lg transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <><i className="fa-solid fa-gear fa-spin"></i> Multiplying Content...</> : 'Generate Campaign'}
                    </button>
                </div>
            </div>
       </div>

       {/* Results */}
       <div className="flex-1 bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden">
            {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50">
                    <i className="fa-solid fa-layer-group text-6xl mb-4"></i>
                    <p>Generated content will appear here.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.twitterThread && (
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-sm text-blue-400"><i className="fa-brands fa-twitter mr-2"></i> Thread</h3>
                                <button className="text-xs text-muted hover:text-white">Copy All</button>
                            </div>
                            <div className="space-y-3">
                                {result.twitterThread.map((tweet, i) => (
                                    <div key={i} className="bg-slate-800 p-3 rounded-lg text-xs text-slate-300 relative">
                                        <span className="absolute -left-2 -top-2 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                                        {tweet}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.linkedinPost && (
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-sm text-blue-600"><i className="fa-brands fa-linkedin mr-2"></i> LinkedIn</h3>
                                <button className="text-xs text-muted hover:text-white">Copy</button>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result.linkedinPost}</p>
                        </div>
                    )}

                    {result.instagramCaption && (
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-sm text-pink-500"><i className="fa-brands fa-instagram mr-2"></i> Caption</h3>
                                <button className="text-xs text-muted hover:text-white">Copy</button>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result.instagramCaption}</p>
                        </div>
                    )}

                    {result.tiktokScript && (
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-sm text-white"><i className="fa-brands fa-tiktok mr-2"></i> Script</h3>
                                <button className="text-xs text-muted hover:text-white">Copy</button>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-black/20 p-3 rounded">{result.tiktokScript}</p>
                        </div>
                    )}

                    {result.newsletter && (
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 md:col-span-2">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-sm text-orange-400"><i className="fa-solid fa-envelope mr-2"></i> Newsletter</h3>
                                <button className="text-xs text-muted hover:text-white">Copy</button>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
                                {result.newsletter}
                            </div>
                        </div>
                    )}
                </div>
            )}
       </div>
    </div>
  );
};