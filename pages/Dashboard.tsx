
import React, { useState, useEffect } from 'react';
import { generateDailyBriefing } from '../services/geminiService';
import { DailyBriefing, Page, MetricCardProps } from '../types';

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group hover:border-indigo-500/30 transition-all shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
        trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
        trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'
      }`}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''}{change}
      </span>
    </div>
    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
  </div>
);

const LoadingState: React.FC = () => {
    const [text, setText] = useState("Initializing Neural Core...");
    
    useEffect(() => {
        const steps = ["SCANNING_NETWORK", "CALIBRATING_VOICE", "ARCHITECTING_STRATEGY", "SYNTHESIZING_BRIEF"];
        let i = 0;
        const interval = setInterval(() => {
            setText(steps[i]);
            i = (i + 1) % steps.length;
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-indigo-500 font-mono text-[10px] font-black tracking-widest uppercase">{text}</p>
        </div>
    );
};

export const Dashboard: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const contextData = {
      metrics: { followers: 124502, growth: "+2.4%" },
      inbox: { unread: 14, urgent: 3 },
      trends: { top: "AI Agents", sentiment: "Excited" }
  };

  useEffect(() => {
      const fetchBriefing = async () => {
          const cached = sessionStorage.getItem('elevate_daily_briefing');
          if (cached) {
              setBriefing(JSON.parse(cached));
              setIsLoading(false);
              return;
          }
          const result = await generateDailyBriefing(contextData);
          if (result) {
              setBriefing(result);
              sessionStorage.setItem('elevate_daily_briefing', JSON.stringify(result));
          }
          setIsLoading(false);
      };
      fetchBriefing();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Hero Briefing */}
      <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl min-h-[300px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/5 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
          
          {isLoading ? (
              <LoadingState />
          ) : briefing ? (
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                      <div>
                          <h2 className="text-4xl font-black text-white italic tracking-tighter mb-3">{briefing.greeting}</h2>
                          <div className="flex gap-4">
                              <span className="bg-slate-800 border border-slate-700 text-indigo-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2">
                                  <i className="fa-solid fa-bolt"></i> {briefing.strategicPulse}
                              </span>
                              <span className="text-slate-500 text-[10px] font-black px-4 py-1.5 flex items-center gap-2 uppercase tracking-widest">
                                  <i className="fa-solid fa-satellite"></i> {briefing.weatherReport}
                              </span>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {briefing.actionItems?.map((item, i) => (
                          <div 
                              key={i} 
                              onClick={() => onNavigate(item.page)}
                              className="group bg-slate-950 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col relative overflow-hidden"
                          >
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                  item.urgency === 'high' ? 'bg-red-500' : 'bg-emerald-500'
                              }`}></div>
                              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3">{item.page}</span>
                              <h4 className="font-bold text-white mb-2 leading-snug group-hover:text-indigo-400 transition-colors">{item.task}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2">{item.context}</p>
                          </div>
                      ))}
                  </div>
              </div>
          ) : (
            <div className="relative z-10 text-center py-12 px-6">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-slate-700">
                    <i className="fa-solid fa-cloud-bolt text-indigo-400 text-2xl"></i>
                </div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">NEURAL_THROTTLE_ACTIVE</h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">The Gemini API has reached its capacity limits for your account. Strategic analysis will resume shortly once the link refreshes.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40">
                        Refresh Link
                    </button>
                    <a href="https://ai.google.dev/pricing" target="_blank" rel="noreferrer" className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700">
                        Check Quota
                    </a>
                </div>
            </div>
          )}
      </div>

      {/* High Frequency Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Network" value="124.5k" change="2.4%" trend="up" icon="fa-users" />
        <MetricCard title="Neural Resonance" value="5.8%" change="0.3%" trend="up" icon="fa-brain" />
        <MetricCard title="System Reach" value="892k" change="1.2%" trend="down" icon="fa-eye" />
        <MetricCard title="Active Sprints" value="12" change="0" trend="neutral" icon="fa-bolt" />
      </div>

      {/* Real-time Ticker / Log */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Live Neural Archive</h3>
            <button onClick={() => onNavigate('archive')} className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">Full Records</button>
          </div>
          <div className="divide-y divide-white/5">
              {[
                  { m: 'CONTENT_STUDIO', t: 'Post Published: "The Future of AI Design"', s: 'Twitter', time: '2m' },
                  { m: 'SENTINEL_RADAR', t: 'Competitor movement detected in NFT sector.', s: 'Alert', time: '14m' },
                  { m: 'SMART_INBOX', t: 'High-priority collaboration request from @acme.', s: 'Email', time: '1h' },
              ].map((log, i) => (
                  <div key={i} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-6">
                          <span className="text-[9px] font-mono text-slate-600 group-hover:text-indigo-500 transition-colors">{log.m}</span>
                          <div>
                              <p className="text-sm font-bold text-white">{log.t}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{log.s}</p>
                          </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">{log.time} ago</span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
