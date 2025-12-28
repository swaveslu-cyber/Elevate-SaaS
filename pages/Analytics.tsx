
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { generateAnalyticsReport } from '../services/geminiService';
import { AnalyticsReport } from '../types';

const METRICS_DATA = [
  { name: 'Mon', reach: 4000, engagement: 2400 },
  { name: 'Tue', reach: 3000, engagement: 1398 },
  { name: 'Wed', reach: 2000, engagement: 9800 },
  { name: 'Thu', reach: 2780, engagement: 3908 },
  { name: 'Fri', reach: 1890, engagement: 4800 },
  { name: 'Sat', reach: 2390, engagement: 3800 },
  { name: 'Sun', reach: 3490, engagement: 4300 },
];

const AUDIENCE_DATA = [
    { name: '18-24', value: 20 },
    { name: '25-34', value: 45 },
    { name: '35-44', value: 25 },
    { name: '45+', value: 10 },
];

export const Analytics: React.FC = () => {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Combine data contexts for the AI
    const dataContext = {
        weeklyPerformance: METRICS_DATA,
        demographics: AUDIENCE_DATA
    };
    const result = await generateAnalyticsReport(dataContext);
    setReport(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with AI Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-chart-pie text-primary"></i> Performance Overview
              </h2>
              <p className="text-sm text-muted">Weekly growth and engagement metrics.</p>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                isAnalyzing 
                ? 'bg-slate-700 text-slate-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white hover:scale-105'
            }`}
          >
              {isAnalyzing ? (
                  <><i className="fa-solid fa-circle-notch fa-spin"></i> Analyzing Data...</>
              ) : (
                  <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate AI Report</>
              )}
          </button>
      </div>

      {/* AI Report Card (Conditional) */}
      {report && (
          <div className="bg-surface rounded-xl border border-primary/30 shadow-2xl overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 border-b border-white/5">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <i className="fa-solid fa-robot text-indigo-300"></i> Intelligence Report
                  </h3>
              </div>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Summary */}
                  <div className="lg:col-span-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Executive Summary</h4>
                      <p className="text-slate-200 leading-relaxed text-sm bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                          {report.summary}
                      </p>
                  </div>

                  {/* Trends */}
                  <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Key Trends Identified</h4>
                      <div className="space-y-3">
                          {report.trends?.map((trend, idx) => (
                              <div key={idx} className="flex gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                      trend.impact === 'positive' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                      trend.impact === 'negative' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                      'bg-slate-400'
                                  }`}></div>
                                  <div>
                                      <h5 className="font-bold text-sm text-slate-200 mb-1">{trend.title}</h5>
                                      <p className="text-xs text-muted leading-relaxed">{trend.description}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Strategic Actions</h4>
                      <ul className="space-y-3">
                          {report.recommendations?.map((rec, idx) => (
                              <li key={idx} className="flex gap-3 text-sm text-slate-300">
                                  <i className="fa-solid fa-check-circle text-primary mt-0.5"></i>
                                  <span className="leading-snug">{rec}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Growth Chart */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Audience Growth & Reach</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={METRICS_DATA}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Area type="monotone" dataKey="reach" stroke="#6366f1" fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="engagement" stroke="#10b981" fillOpacity={1} fill="url(#colorEng)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Bar Chart */}
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Audience Demographics</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={AUDIENCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                     cursor={{fill: '#334155', opacity: 0.4}}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
