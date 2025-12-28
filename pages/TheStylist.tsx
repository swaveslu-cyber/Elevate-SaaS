import React, { useState } from 'react';
import { generateStyleIdentity, generateSocialImage } from '../services/geminiService';
import { StyleIdentity } from '../types';

export const TheStylist: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [identity, setIdentity] = useState<StyleIdentity | null>(null);
  
  // Asset State
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);

  const handleDesign = async () => {
      if (!prompt) return;
      setIsDesigning(true);
      setIdentity(null);
      setHeroImage(null);
      setLogoImage(null);
      
      const result = await generateStyleIdentity(prompt);
      setIdentity(result);
      setIsDesigning(false);
  };

  const handleGenerateAsset = async (type: 'hero' | 'logo') => {
      if (!identity) return;
      setIsGeneratingAsset(true);
      
      const prompt = type === 'hero' 
        ? `High quality hero image for website. Style: ${identity.name}. Vibe: ${identity.vibeDescription}. Primary Color: ${identity.cssTheme.primaryColor}. Professional, clean.`
        : `Minimalist vector logo. Style: ${identity.name}. Primary Color: ${identity.cssTheme.primaryColor}. Simple icon.`;

      const imageUrl = await generateSocialImage(prompt, { aspectRatio: type === 'hero' ? '16:9' : '1:1', highQuality: false });
      
      if (type === 'hero') setHeroImage(imageUrl);
      else setLogoImage(imageUrl);
      
      setIsGeneratingAsset(false);
  };

  // Construct inline styles for the mock landing page
  const getPreviewStyles = () => {
      if (!identity) return {};
      return {
          '--bg': identity.cssTheme.backgroundColor,
          '--surface': identity.cssTheme.surfaceColor,
          '--text': identity.cssTheme.textColor,
          '--primary': identity.cssTheme.primaryColor,
          '--secondary': identity.cssTheme.secondaryColor,
          '--accent': identity.cssTheme.accentColor,
          '--font-head': identity.cssTheme.fontFamilyHeadings,
          '--font-body': identity.cssTheme.fontFamilyBody,
      } as React.CSSProperties;
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Control Panel */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-900/20 to-purple-900/20 pointer-events-none"></div>
            
            <div className="relative z-10 flex-1 w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-fuchsia-600 flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-palette"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Stylist</h2>
                        <p className="text-sm text-muted">AI Brand Architect</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDesign()}
                        placeholder="Describe the brand vibe (e.g. 'Eco-friendly futuristic tech startup')..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-sm focus:border-fuchsia-500 outline-none shadow-inner"
                    />
                    <button 
                        onClick={handleDesign}
                        disabled={isDesigning || !prompt}
                        className="px-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50 min-w-[120px]"
                    >
                        {isDesigning ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Design DNA'}
                    </button>
                </div>
            </div>
       </div>

       {/* Workspace */}
       <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            {/* Left: Design System Spec */}
            <div className="lg:w-80 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden">
                {!identity ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40 p-6 text-center">
                        <i className="fa-solid fa-swatchbook text-6xl mb-4"></i>
                        <p>Waiting for creative direction.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
                        <div>
                            <span className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest block mb-1">Brand Name</span>
                            <h3 className="text-2xl font-black text-white leading-tight">{identity.name}</h3>
                            <p className="text-xs text-slate-400 mt-2 italic">"{identity.vibeDescription}"</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Palette</h4>
                            {[
                                { label: 'Primary', val: identity.cssTheme.primaryColor },
                                { label: 'Secondary', val: identity.cssTheme.secondaryColor },
                                { label: 'Accent', val: identity.cssTheme.accentColor },
                                { label: 'Background', val: identity.cssTheme.backgroundColor },
                                { label: 'Text', val: identity.cssTheme.textColor },
                            ].map((c, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border border-white/10 shadow-sm" style={{backgroundColor: c.val}}></div>
                                        <span className="text-sm text-slate-300 font-medium">{c.label}</span>
                                    </div>
                                    <span className="text-xs font-mono text-slate-500 group-hover:text-white transition-colors">{c.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Typography</h4>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-500 mb-1">Headings</p>
                                <p className="text-white font-bold">{identity.cssTheme.fontFamilyHeadings}</p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-500 mb-1">Body</p>
                                <p className="text-white">{identity.cssTheme.fontFamilyBody}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-700">
                            <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Asset Generator</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => handleGenerateAsset('logo')}
                                    disabled={isGeneratingAsset}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold transition-colors border border-slate-600"
                                >
                                    Generate Logo
                                </button>
                                <button 
                                    onClick={() => handleGenerateAsset('hero')}
                                    disabled={isGeneratingAsset}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold transition-colors border border-slate-600"
                                >
                                    Generate Hero
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Live Preview */}
            <div className="flex-1 bg-black rounded-xl border border-slate-800 overflow-hidden relative shadow-2xl flex flex-col">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Live Simulator</span>
                </div>

                {!identity ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
                        <i className="fa-solid fa-desktop text-8xl mb-6 opacity-20"></i>
                        <p className="text-sm font-mono opacity-50">System Offline</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto transition-all duration-500" style={getPreviewStyles()}>
                        {/* Simulated Website */}
                        <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
                            
                            {/* Navbar */}
                            <nav className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--surface)' }}>
                                <div className="flex items-center gap-3">
                                    {logoImage ? (
                                        <img src={logoImage} className="w-8 h-8 rounded object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded" style={{ backgroundColor: 'var(--primary)' }}></div>
                                    )}
                                    <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-head)' }}>{identity.name}</span>
                                </div>
                                <div className="hidden md:flex gap-6 text-sm opacity-80">
                                    <span>Product</span>
                                    <span>Solutions</span>
                                    <span>Pricing</span>
                                    <span>About</span>
                                </div>
                                <button className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--secondary)', color: 'var(--bg)' }}>
                                    Get Started
                                </button>
                            </nav>

                            {/* Hero Section */}
                            <header className="flex-1 flex flex-col items-center justify-center text-center p-12 lg:p-20 relative overflow-hidden">
                                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4" style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                                        {identity.vibeDescription.split(' ')[0]} Future
                                    </span>
                                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight" style={{ fontFamily: 'var(--font-head)' }}>
                                        The Future of <span style={{ color: 'var(--primary)' }}>Digital</span> Experience.
                                    </h1>
                                    <p className="text-lg opacity-70 max-w-xl mx-auto leading-relaxed">
                                        Crafting immersive realities through {identity.modifiers[0]} design and {identity.modifiers[1]} engineering.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                        <button className="px-8 py-4 rounded-lg font-bold text-sm shadow-lg transform hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                                            Start Building
                                        </button>
                                        <button className="px-8 py-4 rounded-lg font-bold text-sm border-2" style={{ borderColor: 'var(--surface)', color: 'var(--text)' }}>
                                            View Demo
                                        </button>
                                    </div>
                                </div>

                                {/* Generated Hero Image Background/Insert */}
                                {heroImage && (
                                    <div className="mt-16 w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-opacity-20" style={{ borderColor: 'var(--primary)' }}>
                                        <img src={heroImage} className="w-full h-auto" alt="Hero" />
                                    </div>
                                )}
                            </header>

                            {/* Features Section Mockup */}
                            <section className="p-12 lg:p-20" style={{ backgroundColor: 'var(--surface)' }}>
                                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-6 rounded-xl border border-opacity-10" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--text)' }}>
                                            <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
                                                <i className={`fa-solid ${i===1 ? 'fa-bolt' : i===2 ? 'fa-shield' : 'fa-star'} text-xl`} style={{ color: 'var(--accent)' }}></i>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-head)' }}>Feature {i}</h3>
                                            <p className="opacity-60 text-sm leading-relaxed">
                                                Experience the power of {identity.modifiers[i] || 'advanced'} technology integrated seamlessly into your workflow.
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};