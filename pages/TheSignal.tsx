import React, { useState, useEffect, useRef } from 'react';
import { analyzeLiveChat } from '../services/geminiService';
import { StreamMessage, StreamInsight } from '../types';

const MOCK_MESSAGES_POOL = [
    "Love this content!", "Can you explain the API part again?", "Audio is a bit low", "Show the code please", 
    "This is game changing", "What about pricing?", "Is this recorded?", "React is awesome", 
    "Gemini seems faster now", "Deploy it!", "Where can I get the repo?", "Does it scale?",
    "Shoutout from Brazil!", "Amazing UI", "Too complicated", "Simplify the explanation"
];

export const TheSignal: React.FC = () => {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [insight, setInsight] = useState<StreamInsight | null>(null);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate Live Chat
  useEffect(() => {
      let interval: any;
      if (isLive) {
          interval = setInterval(() => {
              const text = MOCK_MESSAGES_POOL[Math.floor(Math.random() * MOCK_MESSAGES_POOL.length)];
              const newMessage: StreamMessage = {
                  id: Date.now().toString(),
                  user: `User${Math.floor(Math.random() * 100)}`,
                  text,
                  timestamp: new Date().toLocaleTimeString()
              };
              setMessages(prev => [...prev.slice(-19), newMessage]); // Keep last 20
          }, 2000);
      }
      return () => clearInterval(interval);
  }, [isLive]);

  // Auto-scroll chat
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  // AI Analysis Loop
  useEffect(() => {
      let analysisInterval: any;
      if (isLive) {
          analysisInterval = setInterval(async () => {
              if (messages.length > 5) {
                  const result = await analyzeLiveChat(messages);
                  if (result) setInsight(result);
              }
          }, 10000); // Analyze every 10s
      }
      return () => clearInterval(analysisInterval);
  }, [isLive, messages]);

  const toggleLive = () => {
      setIsLive(!isLive);
      if (!isLive) setMessages([]); // Clear on start
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
       
       {/* Left: Chat Stream */}
       <div className="lg:w-1/3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-300 text-sm">Live Chat</h3>
                <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold ${isLive ? 'bg-red-900/30 text-red-500' : 'bg-slate-800 text-slate-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                    {isLive ? 'ON AIR' : 'OFFLINE'}
                </div>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                {!isLive && messages.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted opacity-30">
                        <i className="fa-solid fa-comments text-4xl mb-2"></i>
                        <p className="text-xs">Chat offline</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 text-sm animate-fade-in-up">
                        <span className="font-bold text-slate-400 text-xs mt-0.5">{msg.timestamp}</span>
                        <div>
                            <span className="font-bold text-indigo-400 mr-2">{msg.user}:</span>
                            <span className="text-slate-300">{msg.text}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <button 
                    onClick={toggleLive}
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                        isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                    {isLive ? 'End Stream' : 'Go Live'}
                </button>
            </div>
       </div>

       {/* Right: Mission Control */}
       <div className="flex-1 flex flex-col gap-6">
            
            {/* Heads Up Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface border border-slate-700 rounded-xl p-6">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Audience Sentiment</h4>
                    <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${
                            insight?.sentiment === 'Positive' ? 'text-emerald-400' :
                            insight?.sentiment === 'Negative' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                            {insight?.sentiment || '--'}
                        </div>
                        <div className="text-sm text-slate-400">
                            Current mood based on<br/>last {messages.length} messages.
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-slate-700 rounded-xl p-6">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Trending Topic</h4>
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-fire text-orange-500 text-2xl animate-pulse-slow"></i>
                        <span className="text-xl font-bold text-white">{insight?.trendingTopic || 'Waiting for data...'}</span>
                    </div>
                </div>
            </div>

            {/* AI Prompter */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                
                <h3 className="text-indigo-400 font-bold uppercase tracking-widest mb-6 relative z-10">AI Teleprompter</h3>
                
                {insight ? (
                    <div className="relative z-10 max-w-2xl space-y-8">
                        <div className="animate-fade-in">
                            <p className="text-sm text-slate-500 mb-2">Suggested Talking Point</p>
                            <p className="text-3xl font-bold text-white leading-tight">"{insight.suggestedTalkingPoint}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="bg-black/40 p-4 rounded-xl border border-slate-700">
                                <h5 className="text-xs text-emerald-400 font-bold uppercase mb-2">Top Question</h5>
                                <p className="text-slate-200 text-sm">{insight.topQuestions[0] || 'Analyzing...'}</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-slate-700">
                                <h5 className="text-xs text-emerald-400 font-bold uppercase mb-2">Next Question</h5>
                                <p className="text-slate-200 text-sm">{insight.topQuestions[1] || 'Analyzing...'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-muted opacity-50 relative z-10">
                        <i className="fa-solid fa-satellite-dish text-6xl mb-4"></i>
                        <p>Waiting for signal analysis...</p>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};