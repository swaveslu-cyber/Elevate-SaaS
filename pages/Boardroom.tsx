import React, { useState, useRef, useEffect } from 'react';
import { generateBoardroomDebate } from '../services/geminiService';
import { BoardroomTurn } from '../types';

export const Boardroom: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isDebating, setIsDebating] = useState(false);
  const [transcript, setTranscript] = useState<BoardroomTurn[]>([]);
  const [consensus, setConsensus] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleStartDebate = async () => {
      if (!topic) return;
      setIsDebating(true);
      setTranscript([]);
      setConsensus('');
      setCurrentSpeaker(null);

      const session = await generateBoardroomDebate(topic);
      
      if (session) {
          // Playback logic
          for (let i = 0; i < session.dialogue.length; i++) {
              const turn = session.dialogue[i];
              setCurrentSpeaker(turn.speaker);
              
              // Simulate typing delay based on text length
              await new Promise(r => setTimeout(r, 1500)); 
              
              setTranscript(prev => [...prev, turn]);
              setCurrentSpeaker(null);
              
              await new Promise(r => setTimeout(r, 800)); // Pause between speakers
          }
          
          setConsensus(session.consensus);
      }
      
      setIsDebating(false);
  };

  const getAvatarColor = (speaker: string) => {
      switch(speaker) {
          case 'Marcus': return 'bg-indigo-500 shadow-indigo-500/50';
          case 'Linda': return 'bg-emerald-600 shadow-emerald-600/50';
          case 'Kai': return 'bg-pink-500 shadow-pink-500/50';
          default: return 'bg-slate-600';
      }
  };

  return (
    <div className="h-full flex flex-col gap-6 relative">
       
       {/* The Council Visualizer */}
       <div className="bg-slate-900 rounded-xl border border-slate-700 p-8 flex items-center justify-center relative overflow-hidden min-h-[250px]">
            {/* Table / Environment */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-slate-950"></div>
            
            {/* Avatars */}
            <div className="relative z-10 flex gap-12 items-center">
                {/* Linda */}
                <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${currentSpeaker === 'Linda' ? 'scale-110 opacity-100' : 'scale-100 opacity-60'}`}>
                    <div className={`w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-2xl transition-all duration-300 ${getAvatarColor('Linda')}`}>
                        L
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-white">Linda</span>
                        <span className="block text-[10px] text-emerald-400 uppercase tracking-widest">The Pragmatist</span>
                    </div>
                </div>

                {/* Marcus (Center) */}
                <div className={`flex flex-col items-center gap-3 transition-all duration-500 transform -translate-y-4 ${currentSpeaker === 'Marcus' ? 'scale-110 opacity-100' : 'scale-100 opacity-60'}`}>
                    <div className={`w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center text-3xl font-bold text-white shadow-2xl transition-all duration-300 ${getAvatarColor('Marcus')}`}>
                        M
                    </div>
                    <div className="text-center">
                        <span className="block text-base font-bold text-white">Marcus</span>
                        <span className="block text-[10px] text-indigo-400 uppercase tracking-widest">The Visionary</span>
                    </div>
                </div>

                {/* Kai */}
                <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${currentSpeaker === 'Kai' ? 'scale-110 opacity-100' : 'scale-100 opacity-60'}`}>
                    <div className={`w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-2xl transition-all duration-300 ${getAvatarColor('Kai')}`}>
                        K
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-white">Kai</span>
                        <span className="block text-[10px] text-pink-400 uppercase tracking-widest">The Trend Hunter</span>
                    </div>
                </div>
            </div>
       </div>

       {/* Transcript & Input */}
       <div className="flex-1 bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {transcript.length === 0 && !isDebating ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                        <i className="fa-solid fa-people-arrows text-6xl mb-4"></i>
                        <p>Pose a strategic question to convene the council.</p>
                    </div>
                ) : (
                    <>
                        {transcript.map((turn, i) => (
                            <div key={i} className={`flex gap-4 max-w-3xl animate-fade-in ${turn.speaker === 'Marcus' ? 'mx-auto' : turn.speaker === 'Linda' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(turn.speaker)}`}>
                                    {turn.speaker.charAt(0)}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                    turn.speaker === 'Marcus' ? 'bg-indigo-900/40 border border-indigo-500/30 text-indigo-100' :
                                    turn.speaker === 'Linda' ? 'bg-emerald-900/40 border border-emerald-500/30 text-emerald-100' :
                                    'bg-pink-900/40 border border-pink-500/30 text-pink-100'
                                }`}>
                                    <span className="block text-xs font-bold mb-1 opacity-70 uppercase">{turn.speaker}</span>
                                    {turn.text}
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isDebating && currentSpeaker && (
                             <div className="flex justify-center my-4">
                                 <span className="text-xs text-muted animate-pulse">
                                     {currentSpeaker} is speaking...
                                 </span>
                             </div>
                        )}

                        {/* Consensus Card */}
                        {consensus && (
                            <div className="mt-8 mx-auto max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 rounded-xl p-6 shadow-2xl animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                <h3 className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <i className="fa-solid fa-gavel"></i> Final Consensus
                                </h3>
                                <p className="text-slate-200 leading-relaxed font-medium">
                                    {consensus}
                                </p>
                            </div>
                        )}
                        <div ref={transcriptEndRef}></div>
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-700">
                <div className="relative max-w-4xl mx-auto">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartDebate()}
                        disabled={isDebating}
                        placeholder="Ask the council (e.g. 'Should we prioritize TikTok over LinkedIn for B2B?')..."
                        className="w-full bg-slate-800 border border-slate-600 rounded-full py-3 px-6 pr-14 text-sm focus:border-indigo-500 outline-none shadow-xl disabled:opacity-50"
                    />
                    <button 
                        onClick={handleStartDebate}
                        disabled={isDebating || !topic}
                        className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                        {isDebating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    </button>
                </div>
            </div>
       </div>
    </div>
  );
};