import React, { useState, useRef, useEffect } from 'react';
import { chatWithCortex } from '../services/geminiService';

interface OmniCortexProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
}

export const OmniCortex: React.FC<OmniCortexProps> = ({ isOpen, onClose, currentPage }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: `Neural Link Active. I am aware you are in the ${currentPage} module. How can I assist?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Update initial context message when page changes if chat is empty-ish
      if (messages.length <= 1) {
          setMessages([{ role: 'model', text: `Neural Link Active. I am aware you are in the ${currentPage} module. How can I assist?` }]);
      }
  }, [currentPage]);

  useEffect(() => {
      if (isOpen) {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          checkKey();
      }
  }, [isOpen, messages]);

  const checkKey = async () => {
      const win = window as any;
      if (win.aistudio) {
          const keyStatus = await win.aistudio.hasSelectedApiKey();
          setHasKey(keyStatus);
      }
  };

  const handleConnectKey = async () => {
      const win = window as any;
      if (win.aistudio) {
          await win.aistudio.openSelectKey();
          checkKey();
      }
  };

  const handleSend = async () => {
      if (!input.trim()) return;
      const userMsg = input;
      setInput('');
      
      const newHistory = [...messages, { role: 'user' as const, text: userMsg }];
      setMessages(newHistory);
      setIsTyping(true);

      const response = await chatWithCortex(newHistory, currentPage);
      
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      setIsTyping(false);
  };

  return (
    <>
        {/* Backdrop */}
        {isOpen && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose}></div>
        )}

        {/* Panel */}
        <div className={`fixed top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-50 transition-transform duration-300 transform flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <i className="fa-solid fa-brain text-indigo-400 text-xl"></i>
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Omni-Cortex</h3>
                        <p className="text-[10px] text-indigo-300 font-mono uppercase tracking-wider">Context: {currentPage}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            {/* System Status */}
            {!hasKey && (
                <div className="p-3 m-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-amber-200">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>API Key Disconnected</span>
                    </div>
                    <button 
                        onClick={handleConnectKey}
                        className="text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-black px-2 py-1 rounded transition-colors"
                    >
                        Connect
                    </button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1 h-8 items-center">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef}></div>
            </div>

            {/* Suggestions (Context Aware) */}
            <div className="p-2 overflow-x-auto whitespace-nowrap border-t border-slate-800 bg-slate-900/50 flex gap-2">
                <button onClick={() => setInput("Summarize this page")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] text-slate-300 transition-colors">
                    Summarize Page
                </button>
                <button onClick={() => setInput("What should I do next?")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] text-slate-300 transition-colors">
                    Suggest Action
                </button>
                <button onClick={() => setInput("Draft a post about this")} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] text-slate-300 transition-colors">
                    Draft Content
                </button>
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <div className="relative">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Omni-Cortex..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 pr-10 text-sm focus:border-indigo-500 outline-none transition-colors"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input || isTyping}
                        className="absolute right-2 top-1.5 bottom-1.5 w-8 flex items-center justify-center text-indigo-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </>
  );
};