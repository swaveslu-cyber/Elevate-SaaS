import React, { useState, useRef, useEffect } from 'react';
import { igniteHiveMission } from '../services/geminiService';
import { HiveSession } from '../types';

export const TheHive: React.FC = () => {
  const [mission, setMission] = useState('');
  const [isIgniting, setIsIgniting] = useState(false);
  const [session, setSession] = useState<HiveSession | null>(null);
  
  // State for playback animation
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages]);

  const handleIgnite = async () => {
      if (!mission) return;
      setIsIgniting(true);
      setSession(null);
      setDisplayedMessages([]);
      setCurrentStep(0);
      
      const result = await igniteHiveMission(mission);
      setSession(result);
      
      if (result) {
          // Start playback
          playSession(result);
      }
      setIsIgniting(false);
  };

  const playSession = (data: HiveSession) => {
      let step = 0;
      const interval = setInterval(() => {
          if (step >= data.messages.length) {
              clearInterval(interval);
              setCurrentStep(step); // Trigger Master Plan reveal
              return;
          }
          setDisplayedMessages(prev => [...prev, data.messages[step]]);
          step++;
      }, 1500); // 1.5s per message
  };

  const getAgent = (name: string) => {
      return session?.agents.find(a => a.name === name);
  };

  return (
    <div className="h-full flex flex-col gap-6">
        {/* Mission Control */}
        <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 to-amber-900/10 pointer-events-none"></div>
            
            <div className="flex-1 w-full space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <i className="fa-solid fa-users-gear"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Hive</h2>
                        <p className="text-sm text-muted">Autonomous Swarm Intelligence.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={mission}
                        onChange={(e) => setMission(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleIgnite()}
                        placeholder="Define the mission (e.g. 'Plan a guerrilla marketing campaign for a sneaker launch')..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-sm focus:border-amber-500 outline-none shadow-inner"
                    />
                    <button 
                        onClick={handleIgnite}
                        disabled={isIgniting || !mission}
                        className="px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50 min-w-[120px]"
                    >
                        {isIgniting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Ignite Swarm'}
                    </button>
                </div>
            </div>
        </div>

        {/* The Arena */}
        <div className="flex-1 flex gap-6 overflow-hidden">
            
            {/* Active Agents Sidebar */}
            <div className="w-64 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                    <h3 className="font-bold text-xs text-muted uppercase tracking-wider">Active Agents</h3>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {!session ? (
                        <div className="text-center text-muted text-xs italic py-10 opacity-50">
                            Waiting for assignment...
                        </div>
                    ) : (
                        session.agents.map((agent, idx) => (
                            <div key={idx} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex items-center gap-3 animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-${agent.color}-600`}>
                                    {agent.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-white">{agent.name}</h4>
                                    <p className="text-[10px] text-slate-400">{agent.role}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-700 flex flex-col relative overflow-hidden">
                {!session ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-30">
                        <i className="fa-solid fa-comments text-6xl mb-4"></i>
                        <p>Swarm communication offline.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {displayedMessages.map((msg, i) => {
                            const agent = getAgent(msg.agentName);
                            return (
                                <div key={i} className="flex gap-4 animate-fade-in">
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-1 bg-${agent?.color || 'slate'}-600`}>
                                        {agent?.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white">{msg.agentName}</span>
                                            <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                                msg.type === 'idea' ? 'bg-blue-900/30 text-blue-400' :
                                                msg.type === 'critique' ? 'bg-red-900/30 text-red-400' :
                                                msg.type === 'agreement' ? 'bg-emerald-900/30 text-emerald-400' :
                                                'bg-slate-800 text-slate-400'
                                            }`}>{msg.type}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                            {msg.text}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Master Plan Reveal */}
                        {currentStep >= session.messages.length && (
                            <div className="mt-8 bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-500/30 p-8 rounded-xl shadow-2xl animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-6 border-b border-amber-500/20 pb-4">
                                    <i className="fa-solid fa-scroll text-amber-500 text-xl"></i>
                                    <h3 className="text-xl font-bold text-white">The Master Plan</h3>
                                </div>
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {session.masterPlan}
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef}></div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};