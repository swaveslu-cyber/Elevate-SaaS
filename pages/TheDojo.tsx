import React, { useState, useRef, useEffect } from 'react';
import { continueSparringSession, evaluateDojoPerformance } from '../services/geminiService';
import { DojoScenario, DojoFeedback } from '../types';

const SCENARIOS: DojoScenario[] = [
    { id: '1', title: 'The Angry Customer', difficulty: 'Easy', aiPersona: 'Frustrated Customer', description: 'A customer is demanding a refund for a non-refundable digital product.', initialMessage: "I bought your course yesterday and it's useless. I want my money back NOW." },
    { id: '2', title: 'The Lowball Sponsor', difficulty: 'Medium', aiPersona: 'Cheap Brand Manager', description: 'A brand wants you to promote them for "exposure" instead of money.', initialMessage: "Hey! We love your content. We'd love to send you a free t-shirt in exchange for 3 dedicated videos. Great exposure for you!" },
    { id: '3', title: 'The PR Crisis', difficulty: 'Hard', aiPersona: 'Outraged Twitter User', description: 'You made a joke that landed poorly. Twitter is cancelling you.', initialMessage: "Wow. Imagine thinking that was funny. Unfollowed and reported. Do better." },
];

export const TheDojo: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<DojoScenario | null>(null);
  const [chatHistory, setChatHistory] = useState<{sender: string, text: string}[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [feedback, setFeedback] = useState<DojoFeedback | null>(null);
  const [aiEmotion, setAiEmotion] = useState('Neutral');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const startScenario = (scenario: DojoScenario) => {
      setActiveScenario(scenario);
      setChatHistory([{ sender: 'AI', text: scenario.initialMessage }]);
      setFeedback(null);
      setAiEmotion('Annoyed'); // Default starting state for conflict scenarios
  };

  const handleSendMessage = async () => {
      if (!userMessage || !activeScenario) return;
      
      const msg = userMessage;
      setUserMessage('');
      const newHistory = [...chatHistory, { sender: 'You', text: msg }];
      setChatHistory(newHistory);
      
      setIsAiTyping(true);
      const result = await continueSparringSession(newHistory, activeScenario);
      if (result) {
          setChatHistory(prev => [...prev, { sender: 'AI', text: result.reply }]);
          setAiEmotion(result.emotion);
      }
      setIsAiTyping(false);
  };

  const handleEndSession = async () => {
      if (!activeScenario) return;
      setIsAiTyping(true); // Re-use loading state
      const result = await evaluateDojoPerformance(chatHistory, activeScenario);
      setFeedback(result);
      setIsAiTyping(false);
  };

  const getEmotionColor = (emotion: string) => {
      const e = emotion.toLowerCase();
      if (e.includes('happy') || e.includes('calm') || e.includes('satisfied')) return 'text-emerald-400';
      if (e.includes('angry') || e.includes('furious') || e.includes('outraged')) return 'text-red-500';
      return 'text-amber-400';
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {!activeScenario ? (
           // Scenario Selection
           <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface rounded-xl border border-slate-700">
               <div className="text-center mb-10">
                   <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-700">
                       <i className="fa-solid fa-user-ninja text-3xl text-white"></i>
                   </div>
                   <h2 className="text-3xl font-bold mb-2">Welcome to The Dojo</h2>
                   <p className="text-muted max-w-md mx-auto">Sharpen your social skills. Spar with AI personas to master negotiation, crisis management, and empathy.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                   {SCENARIOS.map(scenario => (
                       <button 
                           key={scenario.id}
                           onClick={() => startScenario(scenario)}
                           className="bg-slate-900 border border-slate-700 hover:border-slate-500 p-6 rounded-xl text-left transition-all hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden"
                       >
                           <div className={`absolute top-0 left-0 w-full h-1 ${
                               scenario.difficulty === 'Easy' ? 'bg-emerald-500' : 
                               scenario.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-600'
                           }`}></div>
                           
                           <div className="flex justify-between items-start mb-3">
                               <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-800 ${
                                   scenario.difficulty === 'Easy' ? 'text-emerald-400' : 
                                   scenario.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                               }`}>
                                   {scenario.difficulty}
                               </span>
                               <i className="fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"></i>
                           </div>
                           
                           <h3 className="font-bold text-lg mb-2 text-white group-hover:text-primary transition-colors">{scenario.title}</h3>
                           <p className="text-sm text-slate-400 leading-relaxed">{scenario.description}</p>
                       </button>
                   ))}
               </div>
           </div>
       ) : (
           // Active Session
           <div className="h-full flex gap-6">
               {/* Chat Arena */}
               <div className="flex-1 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden relative">
                   {/* Header */}
                   <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                       <div>
                           <h3 className="font-bold text-sm text-white">{activeScenario.title}</h3>
                           <div className="flex items-center gap-2 text-xs">
                               <span className="text-muted">Opponent:</span>
                               <span className="font-bold text-white">{activeScenario.aiPersona}</span>
                               <span className="text-slate-600">•</span>
                               <span className="text-muted">Mood:</span>
                               <span className={`font-bold ${getEmotionColor(aiEmotion)}`}>{aiEmotion}</span>
                           </div>
                       </div>
                       <button onClick={() => setActiveScenario(null)} className="text-xs text-muted hover:text-white">Exit Dojo</button>
                   </div>

                   {/* Messages */}
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/30">
                       {chatHistory.map((msg, i) => (
                           <div key={i} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                                   msg.sender === 'You' 
                                   ? 'bg-indigo-600 text-white rounded-tr-none' 
                                   : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                               }`}>
                                   {msg.text}
                               </div>
                           </div>
                       ))}
                       {isAiTyping && (
                           <div className="flex justify-start">
                               <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1 items-center h-12">
                                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                               </div>
                           </div>
                       )}
                       <div ref={chatEndRef}></div>
                   </div>

                   {/* Input */}
                   <div className="p-4 bg-slate-900 border-t border-slate-700">
                       <div className="relative">
                           <input 
                               type="text"
                               value={userMessage}
                               onChange={(e) => setUserMessage(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                               disabled={isAiTyping || !!feedback}
                               placeholder={feedback ? "Session ended." : "Type your response..."}
                               className="w-full bg-slate-800 border border-slate-600 rounded-full py-3 px-6 pr-28 text-sm focus:border-indigo-500 outline-none shadow-inner disabled:opacity-50"
                           />
                           {feedback ? (
                               <button 
                                   onClick={() => setActiveScenario(null)}
                                   className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-xs font-bold transition-colors"
                               >
                                   New Session
                               </button>
                           ) : (
                               <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-2">
                                   <button 
                                       onClick={handleEndSession}
                                       className="px-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded-full text-xs font-bold transition-colors"
                                       title="End & Grade"
                                   >
                                       End
                                   </button>
                                   <button 
                                       onClick={handleSendMessage}
                                       disabled={!userMessage}
                                       className="w-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                   >
                                       <i className="fa-solid fa-paper-plane"></i>
                                   </button>
                               </div>
                           )}
                       </div>
                   </div>
               </div>

               {/* Feedback Panel (Appears on End) */}
               {feedback && (
                   <div className="w-80 bg-surface border border-slate-700 rounded-xl p-6 flex flex-col animate-fade-in-right">
                       <div className="text-center mb-6">
                           <h3 className="text-lg font-bold mb-2">Sensei's Report</h3>
                           <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mx-auto border-4 ${
                               feedback.score >= 90 ? 'border-emerald-500 text-emerald-500' :
                               feedback.score >= 70 ? 'border-amber-500 text-amber-500' :
                               'border-red-500 text-red-500'
                           }`}>
                               {feedback.score}
                           </div>
                       </div>

                       <div className="space-y-6">
                           <div>
                               <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Critique</h4>
                               <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                   "{feedback.critique}"
                               </p>
                           </div>
                           <div>
                               <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Sensei's Tip</h4>
                               <div className="flex items-start gap-3 bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20">
                                   <i className="fa-solid fa-lightbulb text-indigo-400 mt-1"></i>
                                   <p className="text-sm text-indigo-200 leading-relaxed">
                                       {feedback.tip}
                                   </p>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       )}
    </div>
  );
};