import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { conductMirrorAudit } from '../services/geminiService';
import { MirrorAnalysis } from '../types';

export const TheMirror: React.FC = () => {
  const [content, setContent] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<MirrorAnalysis | null>(null);
  const [brandDNA, setBrandDNA] = useState<any>(null);

  useEffect(() => {
      const saved = localStorage.getItem('elevate_brand_dna');
      if (saved) {
          setBrandDNA(JSON.parse(saved));
      }
  }, []);

  const handleAudit = async () => {
      if (!content) return;
      setIsAuditing(true);
      const audit = await conductMirrorAudit(content);
      setResult(audit);
      setIsAuditing(false);
  };

  const chartData = result ? [
      { subject: 'Professional', Target: brandDNA?.voiceProfessional || 50, Actual: result.scores.professionalism, fullMark: 100 },
      { subject: 'Energy', Target: brandDNA?.voiceEnergetic || 50, Actual: result.scores.energy, fullMark: 100 },
      { subject: 'Empathy', Target: 80, Actual: result.scores.empathy, fullMark: 100 }, // Implicit target for empathy
      { subject: 'Innovation', Target: 80, Actual: result.scores.innovation, fullMark: 100 }, // Implicit target for innovation
  ] : [];

  if (!brandDNA) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-center">
              <i className="fa-solid fa-triangle-exclamation text-4xl text-amber-500 mb-4"></i>
              <h2 className="text-2xl font-bold text-white mb-2">Neural Core Missing</h2>
              <p className="text-muted max-w-md">Please configure your Brand DNA in Settings before using The Mirror.</p>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col gap-6">
        {/* Header */}
        <div className="bg-surface rounded-xl border border-slate-700 p-6 relative overflow-hidden flex justify-between items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-transparent"></div>
            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-yin-yang text-white"></i> The Mirror
                </h2>
                <p className="text-sm text-muted">Self-Reflection & Brand Integrity Audit</p>
            </div>
            
            <div className="relative z-10 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Target Persona</p>
                <p className="font-bold text-white text-lg">{brandDNA.selectedArchetype}</p>
            </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            {/* Input Section */}
            <div className="lg:w-1/3 flex flex-col gap-4">
                <div className="flex-1 bg-surface border border-slate-700 rounded-xl p-6 flex flex-col">
                    <label className="text-xs font-bold uppercase text-muted mb-2">Content to Reflect</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste recent posts, drafts, or email copy here to check for voice consistency..."
                        className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-sm focus:border-white outline-none resize-none"
                    />
                    <button 
                        onClick={handleAudit}
                        disabled={isAuditing || !content}
                        className="mt-4 w-full py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50"
                    >
                        {isAuditing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Reflect'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-y-auto relative">
                {!result ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted opacity-30">
                        <i className="fa-solid fa-person-rays text-8xl mb-4"></i>
                        <p className="text-lg">Stare into the abyss...</p>
                    </div>
                ) : (
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        {/* Score Card */}
                        <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path className={`${result.integrityScore > 80 ? 'text-emerald-500' : result.integrityScore > 60 ? 'text-amber-500' : 'text-red-500'}`} strokeDasharray={`${result.integrityScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-bold text-white">{result.integrityScore}%</span>
                                    <span className="text-[10px] text-muted uppercase">Match</span>
                                </div>
                            </div>
                            
                            {result.driftDetected && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                    <i className="fa-solid fa-triangle-exclamation"></i> Voice Drift Detected
                                </div>
                            )}
                        </div>

                        {/* Radar Chart */}
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Target" dataKey="Target" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                                    <Radar name="Actual" dataKey="Actual" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                                    <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff'}} />
                                    <legend />
                                </RadarChart>
                            </ResponsiveContainer>
                            <div className="absolute bottom-0 w-full flex justify-center gap-4 text-[10px]">
                                <span className="flex items-center gap-1 text-indigo-400"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Target</span>
                                <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> Actual</span>
                            </div>
                        </div>

                        {/* Analysis Text */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                <h4 className="text-xs font-bold text-muted uppercase mb-2">Drift Analysis</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">{result.driftDescription}</p>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-900/20 to-slate-900 border border-emerald-500/20 p-6 rounded-xl">
                                <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2 flex items-center gap-2">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Suggested Correction
                                </h4>
                                <p className="text-white text-sm font-medium leading-relaxed">
                                    "{result.correction}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};