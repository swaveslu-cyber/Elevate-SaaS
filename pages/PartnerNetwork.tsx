import React, { useState, useEffect } from 'react';
import { findInfluencers, analyzePartnerFit } from '../services/geminiService';
import { InfluencerProfile } from '../types';

export const PartnerNetwork: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [partners, setPartners] = useState<InfluencerProfile[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<InfluencerProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{score: number, analysis: string, outreach: string} | null>(null);

  // Load from local storage
  useEffect(() => {
      const stored = localStorage.getItem('elevate_partners');
      if (stored) {
          setPartners(JSON.parse(stored));
      }
  }, []);

  // Save to local storage
  useEffect(() => {
      if (partners.length > 0) {
          localStorage.setItem('elevate_partners', JSON.stringify(partners));
      }
  }, [partners]);

  const handleSearch = async () => {
      if (!niche) return;
      setIsSearching(true);
      const newPartners = await findInfluencers(niche);
      
      // Merge with existing (avoid duplicates by name for simplicity)
      const existingNames = new Set(partners.map(p => p.name));
      const filteredNew = newPartners.filter(p => !existingNames.has(p.name));
      
      setPartners([...filteredNew, ...partners]);
      setIsSearching(false);
      setNiche('');
  };

  const handleSelectPartner = async (partner: InfluencerProfile) => {
      setSelectedPartner(partner);
      setAnalysisResult(null); // Reset prev analysis
      
      if (!partner.matchScore) {
          setIsAnalyzing(true);
          const result = await analyzePartnerFit(partner);
          if (result) {
              setAnalysisResult(result);
              // Update local state
              const updated = partners.map(p => p.id === partner.id ? { ...p, matchScore: result.score, matchAnalysis: result.analysis } : p);
              setPartners(updated);
          }
          setIsAnalyzing(false);
      } else {
          // Use cached analysis if we stored it properly (we only store score/analysis string in type, outreach is transient)
          // For UX, we might re-generate outreach or store it. Let's re-generate if needed or just show summary.
          setAnalysisResult({
              score: partner.matchScore,
              analysis: partner.matchAnalysis || '',
              outreach: "Regenerate to see new draft."
          });
      }
  };

  const updateStatus = (id: string, status: InfluencerProfile['status']) => {
      const updated = partners.map(p => p.id === id ? { ...p, status } : p);
      setPartners(updated);
      if (selectedPartner && selectedPartner.id === id) {
          setSelectedPartner({ ...selectedPartner, status });
      }
  };

  const deletePartner = (id: string) => {
      const updated = partners.filter(p => p.id !== id);
      setPartners(updated);
      if (selectedPartner?.id === id) setSelectedPartner(null);
  };

  const getPlatformIcon = (platform: string) => {
      const p = platform.toLowerCase();
      if (p.includes('instagram')) return 'fa-brands fa-instagram text-pink-500';
      if (p.includes('tiktok')) return 'fa-brands fa-tiktok text-white';
      if (p.includes('youtube')) return 'fa-brands fa-youtube text-red-500';
      if (p.includes('twitter')) return 'fa-brands fa-twitter text-blue-400';
      return 'fa-solid fa-user';
  };

  return (
    <div className="h-full flex flex-col gap-6">
       {/* Search Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fa-solid fa-handshake-simple text-secondary"></i> Partner Network
                </h2>
                <p className="text-sm text-muted">AI-Driven Influencer Relationship Management (IRM)</p>
            </div>
            
            <div className="flex-1 w-full md:max-w-xl flex gap-2">
                <input 
                    type="text" 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Find influencers in a niche (e.g. 'Sustainable Fashion', 'Indie Game Devs')..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 text-sm focus:border-secondary outline-none shadow-inner"
                />
                <button 
                    onClick={handleSearch}
                    disabled={isSearching || !niche}
                    className="px-6 bg-secondary hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors shadow-lg disabled:opacity-50"
                >
                    {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Scout'}
                </button>
            </div>
       </div>

       <div className="flex-1 flex gap-6 overflow-hidden">
            {/* List Column */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <h3 className="font-bold text-sm text-muted uppercase tracking-wider">Discovered Talent</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {partners.length === 0 ? (
                        <div className="text-center p-8 text-muted opacity-50">
                            <i className="fa-solid fa-users text-4xl mb-2"></i>
                            <p className="text-xs">No partners found. Use the scout tool above.</p>
                        </div>
                    ) : (
                        partners.map(partner => (
                            <div 
                                key={partner.id}
                                onClick={() => handleSelectPartner(partner)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-700/50 flex items-center gap-3 ${
                                    selectedPartner?.id === partner.id 
                                    ? 'bg-secondary/10 border-secondary/50' 
                                    : 'bg-slate-800/30 border-slate-700'
                                }`}
                            >
                                <img src={partner.avatarUrl} alt={partner.name} className="w-10 h-10 rounded-full bg-slate-600" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-white truncate">{partner.name}</h4>
                                    <p className="text-xs text-muted truncate">{partner.handle}</p>
                                </div>
                                {partner.matchScore && (
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                        partner.matchScore > 80 ? 'text-emerald-400 bg-emerald-400/10' : 
                                        partner.matchScore > 50 ? 'text-amber-400 bg-amber-400/10' : 
                                        'text-red-400 bg-red-400/10'
                                    }`}>
                                        {partner.matchScore}%
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 bg-surface rounded-xl border border-slate-700 flex flex-col relative overflow-hidden">
                {selectedPartner ? (
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        {/* Hero Profile */}
                        <div className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <img src={selectedPartner.avatarUrl} alt={selectedPartner.name} className="w-24 h-24 rounded-full border-4 border-surface shadow-xl" />
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-1">{selectedPartner.name}</h2>
                                    <div className="flex items-center gap-4 text-sm text-muted mb-3">
                                        <span className="flex items-center gap-1">
                                            <i className={getPlatformIcon(selectedPartner.platform)}></i> {selectedPartner.handle}
                                        </span>
                                        <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs text-white">
                                            {selectedPartner.followerCount} Followers
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {['Discovered', 'Contacted', 'Negotiating', 'Signed'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(selectedPartner.id, status as any)}
                                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                                    selectedPartner.status === status 
                                                    ? 'bg-secondary text-white' 
                                                    : 'bg-slate-800 text-muted hover:bg-slate-700'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => deletePartner(selectedPartner.id)} className="text-muted hover:text-red-400 transition-colors">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>

                        {/* AI Match Analysis */}
                        <div className="p-8">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center py-12 text-secondary">
                                    <i className="fa-solid fa-dna fa-spin text-4xl mb-4"></i>
                                    <p className="font-bold">Analyzing Brand Compatibility...</p>
                                </div>
                            ) : analysisResult ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                                    <div className="space-y-6">
                                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-lg text-white">Brand Fit Score</h3>
                                                <span className={`text-3xl font-bold ${
                                                    analysisResult.score > 80 ? 'text-emerald-400' : 
                                                    analysisResult.score > 50 ? 'text-amber-400' : 'text-red-400'
                                                }`}>{analysisResult.score}/100</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-1000 ${
                                                        analysisResult.score > 80 ? 'bg-emerald-500' : 
                                                        analysisResult.score > 50 ? 'bg-amber-500' : 'bg-red-500'
                                                    }`} 
                                                    style={{ width: `${analysisResult.score}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed italic">
                                                "{analysisResult.analysis}"
                                            </p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                            <h3 className="font-bold text-lg text-white mb-4">Content Niche</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-slate-700 rounded-lg text-sm text-white">{selectedPartner.niche}</span>
                                                <span className="px-3 py-1 bg-slate-700 rounded-lg text-sm text-white">{selectedPartner.platform}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-xl p-6 border border-indigo-500/30 flex flex-col">
                                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-paper-plane text-indigo-400"></i> Magic Outreach
                                        </h3>
                                        <div className="flex-1 bg-slate-950/50 rounded-lg p-4 text-sm text-slate-300 border border-slate-700/50 leading-relaxed whitespace-pre-wrap mb-4 font-mono">
                                            {analysisResult.outreach}
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold transition-colors">Regenerate</button>
                                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-colors shadow-lg">Copy to Clipboard</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <button 
                                        onClick={() => handleSelectPartner(selectedPartner)}
                                        className="px-6 py-3 bg-secondary hover:bg-emerald-600 text-white rounded-lg font-bold shadow-lg transition-colors"
                                    >
                                        Run Deep Audit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50">
                        <i className="fa-regular fa-id-card text-6xl mb-4"></i>
                        <p>Select a partner to view details.</p>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};