import React, { useState, useRef, useEffect } from 'react';
import { generateDeepQuestion, synthesizeDeepContent } from '../services/geminiService';

export const TheDeep: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [history, setHistory] = useState<{question: string, answer: string}[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [finalPiece, setFinalPiece] = useState<string | null>(null);
  const [stage, setStage] = useState<'init' | 'interview' | 'complete'>('init');
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, currentQuestion]);

  const handleStart = async () => {
      if (!topic) return;
      setIsThinking(true);
      setStage('interview');
      
      const firstQ = await generateDeepQuestion(topic, []);
      setCurrentQuestion(firstQ);
      setIsThinking(false);
  };

  const handleAnswer = async () => {
      if (!currentAnswer) return;
      
      const newHistory = [...history, { question: currentQuestion, answer: currentAnswer }];
      setHistory(newHistory);
      setCurrentAnswer('');
      setIsThinking(true);

      const nextQ = await generateDeepQuestion(topic, newHistory);
      setCurrentQuestion(nextQ);
      setIsThinking(false);
  };

  const handleCrystallize = async () => {
      setIsSynthesizing(true);
      const result = await synthesizeDeepContent(topic, history);
      setFinalPiece(result);
      setStage('complete');
      setIsSynthesizing(false);
  };

  const handleReset = () => {
      setTopic('');
      setHistory([]);
      setCurrentQuestion('');
      setCurrentAnswer('');
      setFinalPiece(null);
      setStage('init');
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-slate-950 rounded-xl border border-slate-800">
        
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950 opacity-50 pointer-events-none"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        
        {/* Header */}
        <div className="relative z-10 p-6 flex justify-between items-center bg-slate-900/50 border-b border-white/5 backdrop-blur-md">
            <h2 className="text-xl font-light text-blue-200 tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-water"></i> THE DEEP
            </h2>
            {stage !== 'init' && (
                <button onClick={handleReset} className="text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-wider">
                    Surface
                </button>
            )}
        </div>

        {/* Stage: Init */}
        {stage === 'init' && (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="w-full max-w-2xl text-center space-y-8">
                    <div className="w-24 h-24 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-pulse-slow">
                        <i className="fa-solid fa-anchor text-4xl text-blue-400"></i>
                    </div>
                    <h1 className="text-4xl font-light text-white leading-tight">
                        What idea is asking to be born?
                    </h1>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                            placeholder="Enter a raw concept, opinion, or topic..."
                            className="w-full bg-transparent border-b-2 border-slate-700 py-4 text-center text-xl text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={handleStart}
                        disabled={!topic || isThinking}
                        className="px-8 py-3 bg-blue-900/30 hover:bg-blue-800/30 text-blue-200 border border-blue-500/30 rounded-full transition-all hover:scale-105"
                    >
                        {isThinking ? 'Initializing Dive...' : 'Begin Descent'}
                    </button>
                </div>
            </div>
        )}

        {/* Stage: Interview */}
        {stage === 'interview' && (
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 space-y-12 max-w-3xl mx-auto w-full scroll-smooth">
                    {history.map((turn, i) => (
                        <div key={i} className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
                            <div className="text-blue-300 font-serif text-lg leading-relaxed italic">
                                "{turn.question}"
                            </div>
                            <div className="text-slate-300 text-base leading-relaxed pl-6 border-l-2 border-slate-700">
                                {turn.answer}
                            </div>
                        </div>
                    ))}
                    
                    <div className="space-y-6 animate-fade-in-up" ref={transcriptEndRef}>
                        <div className="text-2xl font-serif text-white leading-relaxed">
                            {isThinking ? (
                                <span className="animate-pulse text-slate-500">Listening...</span>
                            ) : (
                                currentQuestion
                            )}
                        </div>
                        
                        {!isThinking && (
                            <div className="relative">
                                <textarea 
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                    placeholder="Type your thoughts freely..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-lg text-white focus:border-blue-500/50 outline-none resize-none min-h-[150px] shadow-inner"
                                    autoFocus
                                />
                                <div className="absolute bottom-4 right-4 flex gap-3">
                                    {history.length > 2 && (
                                        <button 
                                            onClick={handleCrystallize}
                                            className="px-4 py-2 bg-emerald-900/30 hover:bg-emerald-800/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Crystallize
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleAnswer}
                                        disabled={!currentAnswer}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg transition-colors disabled:opacity-50"
                                    >
                                        Next <i className="fa-solid fa-arrow-down ml-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Stage: Complete */}
        {stage === 'complete' && finalPiece && (
            <div className="relative z-10 flex-1 overflow-y-auto p-8 animate-fade-in">
                <div className="max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-blue-500/20 p-12 rounded-2xl shadow-2xl relative">
                    {/* Glowing effect */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2 font-serif">The Artifact</h2>
                            <p className="text-blue-300/70 text-sm uppercase tracking-widest">Crystallized Thought Leadership</p>
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(finalPiece)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <i className="fa-regular fa-copy text-xl"></i>
                        </button>
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none text-slate-300 font-serif leading-loose whitespace-pre-wrap">
                        {finalPiece}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 flex justify-center">
                        <button 
                            onClick={handleReset}
                            className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-full transition-colors text-sm uppercase tracking-widest"
                        >
                            Start New Dive
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Loading Overlay for Synthesis */}
        {isSynthesizing && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-t-2 border-emerald-500 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fa-solid fa-gem text-4xl text-white animate-pulse"></i>
                    </div>
                </div>
                <h3 className="text-2xl font-light text-white tracking-widest mb-2">CRYSTALLIZING</h3>
                <p className="text-slate-400">Synthesizing insights into narrative structure...</p>
            </div>
        )}
    </div>
  );
};