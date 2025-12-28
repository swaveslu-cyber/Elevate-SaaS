import React, { useState } from 'react';
import { generateFunnelAssets } from '../services/geminiService';
import { FunnelAssets } from '../types';

export const TheBlueprint: React.FC = () => {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [benefit, setBenefit] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [assets, setAssets] = useState<FunnelAssets | null>(null);
  const [activeStep, setActiveStep] = useState<'magnet' | 'landing' | 'email'>('magnet');

  const handleBuild = async () => {
      if (!product || !audience) return;
      setIsBuilding(true);
      setAssets(null);
      const result = await generateFunnelAssets(product, audience, benefit);
      setAssets(result);
      setIsBuilding(false);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Architect Control Panel */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            <div className="relative z-10 min-w-[300px]">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-2 text-white">
                    <i className="fa-solid fa-compass-drafting text-blue-500"></i> The Blueprint
                </h2>
                <p className="text-sm text-muted mb-6">Architect high-conversion funnels.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-1">Product / Offer</label>
                        <input 
                            type="text" 
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                            placeholder="e.g. 'Ultimate SEO Course'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-1">Target Audience</label>
                        <input 
                            type="text" 
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g. 'Small Business Owners'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-1">Key Benefit</label>
                        <input 
                            type="text" 
                            value={benefit}
                            onChange={(e) => setBenefit(e.target.value)}
                            placeholder="e.g. 'Double traffic in 30 days'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleBuild}
                        disabled={isBuilding || !product}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isBuilding ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Designing...</> : 'Generate Assets'}
                    </button>
                </div>
            </div>

            {/* Schematic Visualization */}
            <div className="flex-1 flex items-center justify-center relative z-10 bg-slate-900/50 rounded-xl border border-slate-700 border-dashed p-4">
                {!assets ? (
                    <div className="text-center text-muted opacity-50">
                        <i className="fa-solid fa-diagram-project text-5xl mb-3"></i>
                        <p>Waiting for specs...</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full h-full justify-center">
                        {/* Step 1: Magnet */}
                        <div 
                            onClick={() => setActiveStep('magnet')}
                            className={`w-40 h-32 rounded-xl border-2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:scale-105 ${
                                activeStep === 'magnet' ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-600 hover:border-slate-400'
                            }`}
                        >
                            <i className="fa-solid fa-magnet text-2xl mb-2 text-pink-400"></i>
                            <span className="text-xs font-bold uppercase tracking-wider">Lead Magnet</span>
                        </div>

                        {/* Connector */}
                        <i className="fa-solid fa-arrow-right text-slate-500 text-xl hidden md:block"></i>
                        <i className="fa-solid fa-arrow-down text-slate-500 text-xl md:hidden"></i>

                        {/* Step 2: Landing */}
                        <div 
                            onClick={() => setActiveStep('landing')}
                            className={`w-40 h-32 rounded-xl border-2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:scale-105 ${
                                activeStep === 'landing' ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-600 hover:border-slate-400'
                            }`}
                        >
                            <i className="fa-solid fa-desktop text-2xl mb-2 text-emerald-400"></i>
                            <span className="text-xs font-bold uppercase tracking-wider">Landing Page</span>
                        </div>

                        {/* Connector */}
                        <i className="fa-solid fa-arrow-right text-slate-500 text-xl hidden md:block"></i>
                        <i className="fa-solid fa-arrow-down text-slate-500 text-xl md:hidden"></i>

                        {/* Step 3: Email */}
                        <div 
                            onClick={() => setActiveStep('email')}
                            className={`w-40 h-32 rounded-xl border-2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:scale-105 ${
                                activeStep === 'email' ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-600 hover:border-slate-400'
                            }`}
                        >
                            <i className="fa-solid fa-envelope-open-text text-2xl mb-2 text-amber-400"></i>
                            <span className="text-xs font-bold uppercase tracking-wider">Email Seq.</span>
                        </div>
                    </div>
                )}
            </div>
       </div>

       {/* Detail Editor */}
       {assets && (
           <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col animate-fade-in-up">
               <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                   <h3 className="font-bold text-white flex items-center gap-2">
                       {activeStep === 'magnet' && <><i className="fa-solid fa-magnet text-pink-400"></i> The Hook (Magnet)</>}
                       {activeStep === 'landing' && <><i className="fa-solid fa-desktop text-emerald-400"></i> The Pitch (Landing Page)</>}
                       {activeStep === 'email' && <><i className="fa-solid fa-envelope-open-text text-amber-400"></i> The Nurture (Email)</>}
                   </h3>
               </div>

               <div className="flex-1 overflow-y-auto p-8">
                   {activeStep === 'magnet' && (
                       <div className="max-w-2xl mx-auto space-y-6">
                           <div className="bg-pink-500/10 border border-pink-500/30 p-6 rounded-xl text-center">
                               <span className="text-xs font-bold uppercase text-pink-400 tracking-widest mb-2 block">{assets.leadMagnet.format}</span>
                               <h2 className="text-3xl font-bold text-white mb-4">"{assets.leadMagnet.title}"</h2>
                               <p className="text-slate-300 leading-relaxed">{assets.leadMagnet.description}</p>
                           </div>
                           <button onClick={() => copyToClipboard(assets.leadMagnet.description)} className="text-xs text-muted hover:text-white flex items-center gap-1 mx-auto"><i className="fa-regular fa-copy"></i> Copy Idea</button>
                       </div>
                   )}

                   {activeStep === 'landing' && (
                       <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl p-8 shadow-2xl relative">
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl"></div>
                           <div className="text-center mb-8">
                               <h1 className="text-3xl font-extrabold mb-2 leading-tight">{assets.landingPage.headline}</h1>
                               <p className="text-lg text-slate-600 font-medium">{assets.landingPage.subheadline}</p>
                           </div>
                           
                           <div className="space-y-3 mb-8">
                               {assets.landingPage.bullets.map((bullet, i) => (
                                   <div key={i} className="flex gap-3 items-start">
                                       <i className="fa-solid fa-check text-green-500 mt-1"></i>
                                       <p className="text-slate-700 font-medium">{bullet}</p>
                                   </div>
                               ))}
                           </div>

                           <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl rounded shadow-lg transition-colors uppercase tracking-wide">
                               {assets.landingPage.cta}
                           </button>
                       </div>
                   )}

                   {activeStep === 'email' && (
                       <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                           {assets.emails.map((email, i) => (
                               <div key={i} className="bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-amber-500/50 transition-colors group">
                                   <div className="flex justify-between items-center mb-4">
                                       <span className="text-xs font-bold uppercase text-amber-500">Email {i+1}</span>
                                       <button onClick={() => copyToClipboard(email.bodyOutline)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-white"><i className="fa-regular fa-copy"></i></button>
                                   </div>
                                   <h4 className="font-bold text-white text-sm mb-3">Subject: {email.subject}</h4>
                                   <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-mono bg-black/20 p-3 rounded h-40 overflow-y-auto">
                                       {email.bodyOutline}
                                   </div>
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