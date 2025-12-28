import React, { useState } from 'react';
import { generateAdCampaign } from '../services/geminiService';
import { AdCampaign, AdVariant } from '../types';

export const Adrenaline: React.FC = () => {
  const [product, setProduct] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'copy' | 'preview'>('preview');

  const handleGenerate = async () => {
      if (!product) return;
      setIsGenerating(true);
      setCampaign(null);
      const result = await generateAdCampaign(product, platform);
      if (result) {
          setCampaign(result);
          if (result.variants.length > 0) setActiveVariant(result.variants[0].id);
      }
      setIsGenerating(false);
  };

  const getVariant = () => campaign?.variants.find(v => v.id === activeVariant);

  return (
    <div className="h-full flex flex-col gap-6">
       {/* High Energy Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-black to-slate-950 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-64 h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_11px)] opacity-5 pointer-events-none"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl font-black italic flex items-center gap-2 text-white tracking-tight">
                    <i className="fa-solid fa-bolt text-red-500 animate-pulse"></i> ADRENALINE
                </h2>
                <p className="text-sm text-red-200/70 font-medium">Performance Creative Engine</p>
            </div>

            <div className="relative z-10 flex-1 w-full md:max-w-2xl flex gap-3">
                <input 
                    type="text" 
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="Product URL or Name (e.g. 'Lumina 4K Webcam')"
                    className="flex-1 bg-black/60 border border-slate-600 rounded-lg py-3 px-4 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-white shadow-inner"
                />
                <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="bg-black/60 border border-slate-600 rounded-lg px-4 text-sm text-white focus:border-red-500 outline-none"
                >
                    <option>Facebook</option>
                    <option>Instagram</option>
                    <option>LinkedIn</option>
                    <option>TikTok</option>
                </select>
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !product}
                    className="px-6 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all disabled:opacity-50 disabled:shadow-none"
                >
                    {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'IGNITE'}
                </button>
            </div>
       </div>

       {/* Main Dashboard */}
       <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* Left: Variant Selectors */}
            <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto">
                {!campaign ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-6 text-center">
                        <i className="fa-solid fa-gauge-high text-4xl mb-3"></i>
                        <p className="text-sm">Awaiting Target Data</p>
                    </div>
                ) : (
                    campaign.variants.map((v) => (
                        <div 
                            key={v.id}
                            onClick={() => setActiveVariant(v.id)}
                            className={`p-5 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${
                                activeVariant === v.id 
                                ? 'bg-red-950/30 border-red-500 shadow-lg shadow-red-900/20' 
                                : 'bg-surface border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                    activeVariant === v.id ? 'bg-red-500 text-black' : 'bg-slate-700 text-slate-300'
                                }`}>
                                    {v.angle}
                                </span>
                                <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold">
                                    <i className="fa-solid fa-arrow-trend-up"></i>
                                    {v.predictedCTR}%
                                </div>
                            </div>
                            <h4 className="font-bold text-sm text-white line-clamp-2 mb-1">{v.headline}</h4>
                            <p className="text-xs text-muted line-clamp-2">{v.hook}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Right: Ad Preview/Editor */}
            <div className="flex-1 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden relative">
                {!getVariant() ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-30">
                        <i className="fa-solid fa-rectangle-ad text-8xl mb-6"></i>
                        <p className="text-lg font-bold">Select a variant to visualize</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                            <div className="flex bg-slate-800 p-1 rounded-lg">
                                <button 
                                    onClick={() => setViewMode('preview')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'preview' ? 'bg-slate-600 text-white' : 'text-muted hover:text-white'}`}
                                >
                                    <i className="fa-solid fa-eye mr-2"></i> Preview
                                </button>
                                <button 
                                    onClick={() => setViewMode('copy')}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'copy' ? 'bg-slate-600 text-white' : 'text-muted hover:text-white'}`}
                                >
                                    <i className="fa-solid fa-code mr-2"></i> Copy/Edit
                                </button>
                            </div>
                            <button className="text-xs font-bold text-red-400 hover:text-white transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-rocket"></i> Launch to Ads Manager
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-900/30 flex justify-center">
                            {viewMode === 'preview' ? (
                                <div className="w-full max-w-md bg-white text-black rounded-lg overflow-hidden shadow-2xl">
                                    {/* Mock Header */}
                                    <div className="p-3 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm">Elevate Brand</div>
                                            <div className="text-xs text-gray-500">Sponsored • <i className="fa-solid fa-globe"></i></div>
                                        </div>
                                        <i className="fa-solid fa-ellipsis text-gray-400"></i>
                                    </div>
                                    
                                    {/* Ad Copy */}
                                    <div className="px-3 pb-3 text-sm text-gray-800 whitespace-pre-wrap">
                                        <p className="font-bold mb-1">{getVariant()?.hook}</p>
                                        <p>{getVariant()?.body}</p>
                                    </div>

                                    {/* Mock Image */}
                                    <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-center p-8 relative overflow-hidden group">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                            <i className="fa-solid fa-image text-9xl text-gray-400"></i>
                                        </div>
                                        <p className="relative z-10 text-xs text-gray-500 font-mono italic max-w-xs mx-auto border border-gray-400 border-dashed p-2 rounded">
                                            [Visual Prompt]<br/>
                                            {getVariant()?.visualDescription}
                                        </p>
                                        <button className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            Generate with Gemini
                                        </button>
                                    </div>

                                    {/* CTA Bar */}
                                    <div className="bg-gray-100 p-3 flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Learn More</div>
                                            <div className="font-bold text-sm line-clamp-1">{getVariant()?.headline}</div>
                                        </div>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm">
                                            Learn More
                                        </button>
                                    </div>
                                    
                                    {/* Engagement Bar */}
                                    <div className="p-3 border-t border-gray-200 flex justify-between text-gray-500 text-sm">
                                        <span><i className="fa-regular fa-thumbs-up mr-1"></i> Like</span>
                                        <span><i className="fa-regular fa-comment mr-1"></i> Comment</span>
                                        <span><i className="fa-solid fa-share mr-1"></i> Share</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl space-y-6">
                                    <div className="bg-surface p-4 rounded-xl border border-slate-700">
                                        <label className="block text-xs font-bold text-muted uppercase mb-2">Hook</label>
                                        <textarea className="w-full bg-slate-900/50 text-slate-200 text-sm p-3 rounded-lg border border-slate-600 outline-none h-20" defaultValue={getVariant()?.hook}></textarea>
                                    </div>
                                    <div className="bg-surface p-4 rounded-xl border border-slate-700">
                                        <label className="block text-xs font-bold text-muted uppercase mb-2">Body Copy</label>
                                        <textarea className="w-full bg-slate-900/50 text-slate-200 text-sm p-3 rounded-lg border border-slate-600 outline-none h-40" defaultValue={getVariant()?.body}></textarea>
                                    </div>
                                    <div className="bg-surface p-4 rounded-xl border border-slate-700">
                                        <label className="block text-xs font-bold text-muted uppercase mb-2">Headline</label>
                                        <input className="w-full bg-slate-900/50 text-slate-200 text-sm p-3 rounded-lg border border-slate-600 outline-none" defaultValue={getVariant()?.headline} />
                                    </div>
                                    <div className="bg-surface p-4 rounded-xl border border-slate-700">
                                        <label className="block text-xs font-bold text-muted uppercase mb-2">Visual Prompt</label>
                                        <textarea className="w-full bg-slate-900/50 text-slate-200 text-sm p-3 rounded-lg border border-slate-600 outline-none h-24" defaultValue={getVariant()?.visualDescription}></textarea>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};