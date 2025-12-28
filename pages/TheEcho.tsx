import React, { useState, useRef } from 'react';
import { transmuteVoiceNote } from '../services/geminiService';
import { EchoResult } from '../types';

export const TheEcho: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<EchoResult | null>(null);
  
  // Mock recording for browser compatibility in this demo environment
  // In a real app, use MediaRecorder API
  const handleRecordToggle = () => {
      if (!isRecording) {
          setIsRecording(true);
          setTranscript('');
          setResult(null);
      } else {
          setIsRecording(false);
          // Simulate a recorded transcript for demo purposes
          const mockTranscript = "I've been thinking a lot about how AI isn't just a tool, it's a collaborator. Like, we used to treat software as a passive thing, you click a button and it does X. But now, with LLMs, it's more like a dance. You lead, it follows, sometimes it leads. It changes the whole creative process from construction to curation. I think that's the big shift for 2025.";
          setTranscript(mockTranscript);
          handleProcess(mockTranscript);
      }
  };

  const handleProcess = async (text: string) => {
      setIsProcessing(true);
      const data = await transmuteVoiceNote(text);
      setResult(data);
      setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 rounded-xl border border-slate-800">
            {/* Background Viz */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className={`w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 blur-[100px] transition-all duration-300 ${isRecording ? 'scale-150 animate-pulse' : 'scale-100'}`}></div>
            </div>

            <div className="relative z-10 text-center w-full max-w-2xl px-6">
                <h2 className="text-3xl font-light text-white mb-2 tracking-widest flex items-center justify-center gap-3">
                    <i className="fa-solid fa-microphone-lines text-cyan-400"></i> THE ECHO
                </h2>
                <p className="text-cyan-200/60 font-mono text-xs uppercase tracking-widest mb-12">
                    Voice-to-Viral Engine
                </p>

                <button 
                    onClick={handleRecordToggle}
                    className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all shadow-2xl mb-8 mx-auto ${
                        isRecording 
                        ? 'bg-red-500/20 border-red-500 text-red-500 scale-110' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-500'
                    }`}
                >
                    <i className={`fa-solid fa-microphone text-4xl ${isRecording ? 'animate-bounce' : ''}`}></i>
                </button>

                <p className={`text-sm font-medium transition-colors ${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                    {isRecording ? 'Recording... Tap to Finish' : 'Tap to Record Thought'}
                </p>

                {isProcessing && (
                    <div className="mt-8 flex items-center justify-center gap-3 text-cyan-400">
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        <span className="text-sm font-bold">Transmuting Audio...</span>
                    </div>
                )}
            </div>
       </div>

       {/* Results Panel */}
       {result && (
           <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col animate-fade-in-up">
                <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                    <h3 className="font-bold text-white">Echo Manifest</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Transcript & Summary */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Transcript</h4>
                            <p className="text-sm text-slate-300 italic leading-relaxed">"{result.transcript}"</p>
                        </div>
                        
                        <div>
                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Core Idea (Summary)</h4>
                            <p className="text-lg text-white font-medium leading-relaxed">{result.summary}</p>
                        </div>
                    </div>

                    {/* Content Outputs */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <i className="fa-brands fa-twitter text-blue-400"></i> Tweets
                                </h4>
                                <button className="text-xs text-muted hover:text-white">Copy All</button>
                            </div>
                            <div className="space-y-3">
                                {result.tweets.map((tweet, i) => (
                                    <div key={i} className="p-3 bg-slate-800 rounded text-sm text-slate-300 border border-slate-700/50">
                                        {tweet}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <i className="fa-brands fa-linkedin text-blue-600"></i> LinkedIn Post
                                </h4>
                                <button className="text-xs text-muted hover:text-white">Copy</button>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result.linkedInPost}</p>
                        </div>
                        
                        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Action Items</h4>
                            <ul className="space-y-2">
                                {result.actionItems.map((item, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-emerald-100">
                                        <i className="fa-solid fa-check mt-1 text-emerald-500"></i>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
           </div>
       )}
    </div>
  );
};