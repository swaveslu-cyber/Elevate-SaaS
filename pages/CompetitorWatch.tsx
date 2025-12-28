import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { analyzeCompetitor } from '../services/geminiService';
import { CompetitorAnalysis } from '../types';

export const CompetitorWatch: React.FC = () => {
  const [competitorName, setCompetitorName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!competitorName) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    const result = await analyzeCompetitor(competitorName);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const chartData = analysis ? [
    { subject: 'Innovation', A: analysis.scores.innovation, fullMark: 10 },
    { subject: 'Visuals', A: analysis.scores.visuals, fullMark: 10 },
    { subject: 'Voice', A: analysis.scores.voice, fullMark: 10 },
    { subject: 'Engagement', A: analysis.scores.engagement, fullMark: 10 },
    { subject: 'Frequency', A: analysis.scores.frequency, fullMark: 10 },
  ] : [];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header / Input */}
      <div className="bg-surface rounded-xl border border-slate-700 p-8 flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 to-slate-950/50"></div>
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, #ef4444 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1}}></div>
          
          <div className="relative z-10 w-full max-w-2xl text-center">
              <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
                  <i className="fa-solid fa-tower-observation text-red-500"></i>
                  Competitor Watchtower
              </h2>
              <p className="text-muted mb-6">Real-time reconnaissance using Gemini Search Grounding.</p>
              
              <div className="flex gap-2">
                  <input 
                      type="text" 
                      value={competitorName}
                      onChange={(e) => setCompetitorName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      placeholder="Enter competitor name (e.g. 'Nike', 'OpenAI', 'Slack')..."
                      className="flex-1 bg-slate-950/80 border border-slate-600 rounded-lg py-3 px-4 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none shadow-xl transition-all"
                  />
                  <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !competitorName}
                      className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-6 py-3 text-sm font-bold transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50"
                  >
                      {isAnalyzing ? <i className="fa-solid fa-radar fa-spin"></i> : 'Scan'}
                  </button>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
          {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-red-400 gap-4">
                  <div className="w-20 h-20 border-4 border-red-900/30 border-t-red-500 rounded-full animate-spin"></div>
                  <p className="animate-pulse font-mono uppercase tracking-widest text-xs">Gathering Intel...</p>
              </div>
          ) : !analysis ? (
              <div className="h-full flex flex-col items-center justify-center text-muted opacity-40">
                  <i className="fa-solid fa-binoculars text-6xl mb-4"></i>
                  <p>Awaiting target designation.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6 animate-fade-in">
                  
                  {/* Left Col: Radar & Scores */}
                  <div className="bg-surface border border-slate-700 rounded-xl p-6 flex flex-col">
                      <h3 className="font-bold text-lg mb-4 text-red-400 uppercase tracking-wider text-xs">Threat Matrix</h3>
                      <div className="flex-1 min-h-[250px] relative">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                  <PolarGrid stroke="#334155" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                  <Radar name={analysis.name} dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                                  <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#ef4444', color: '#fff'}} itemStyle={{color: '#fff'}} />
                              </RadarChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                          <div className="bg-slate-800 p-2 rounded">
                              <span className="block text-xs text-muted">Innovation</span>
                              <span className="font-bold text-white">{analysis.scores.innovation}/10</span>
                          </div>
                          <div className="bg-slate-800 p-2 rounded">
                              <span className="block text-xs text-muted">Engagement</span>
                              <span className="font-bold text-white">{analysis.scores.engagement}/10</span>
                          </div>
                      </div>
                  </div>

                  {/* Middle Col: Intel & Analysis */}
                  <div className="lg:col-span-2 space-y-6">
                      
                      {/* Summary Card */}
                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                          <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-xl text-white">{analysis.name}</h3>
                              <span className="text-xs text-muted font-mono">{analysis.lastUpdated}</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed text-sm">{analysis.summary}</p>
                      </div>

                      {/* Recent Moves Feed */}
                      <div className="bg-surface border border-slate-700 rounded-xl p-6">
                          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                              <i className="fa-solid fa-satellite-dish"></i> Recent Activity Detected
                          </h4>
                          <div className="space-y-3">
                              {analysis.recentMoves.map((move, i) => (
                                  <div key={i} className="flex gap-3 items-start p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                      <i className="fa-solid fa-caret-right text-red-500 mt-1"></i>
                                      <p className="text-sm text-slate-300">{move}</p>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Strategy Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-700/30 rounded-xl p-5">
                              <h4 className="text-amber-500 font-bold text-sm mb-2 flex items-center gap-2">
                                  <i className="fa-solid fa-bullseye"></i> The Gap
                              </h4>
                              <p className="text-sm text-slate-200">{analysis.strategicGap}</p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-700/30 rounded-xl p-5">
                              <h4 className="text-emerald-500 font-bold text-sm mb-2 flex items-center gap-2">
                                  <i className="fa-solid fa-chess-knight"></i> Counter Move
                              </h4>
                              <p className="text-sm text-slate-200">{analysis.counterMove}</p>
                          </div>
                      </div>

                  </div>
              </div>
          )}
      </div>
    </div>
  );
};