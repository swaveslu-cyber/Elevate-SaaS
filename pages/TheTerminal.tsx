import React, { useState, useEffect, useRef } from 'react';
import { processTerminalCommand } from '../services/geminiService';
import { TerminalMessage, Page } from '../types';

interface TheTerminalProps {
    onNavigate: (page: Page) => void;
}

export const TheTerminal: React.FC<TheTerminalProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<TerminalMessage[]>([
      { type: 'system', content: 'ELEVATE OS KERNEL v2.0.4 LOADED', timestamp: new Date().toLocaleTimeString() },
      { type: 'system', content: 'Neural Core: ONLINE. Gemini 3.0 Pro: CONNECTED.', timestamp: new Date().toLocaleTimeString() },
      { type: 'output', content: 'Welcome, Administrator. Type a command or ask a question.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
  }, [history]);

  const handleCommand = async () => {
      if (!input.trim()) return;
      const cmd = input;
      setInput('');
      
      setHistory(prev => [...prev, { type: 'input', content: cmd, timestamp: new Date().toLocaleTimeString() }]);
      setIsProcessing(true);

      if (cmd.toLowerCase() === 'clear') {
          setHistory([]);
          setIsProcessing(false);
          return;
      }

      if (cmd.toLowerCase() === 'help') {
          setHistory(prev => [...prev, { type: 'output', content: `
AVAILABLE COMMANDS:
-------------------
> navigate [module]   : Switch to a specific module (e.g. 'studio', 'dashboard')
> generate [prompt]   : Create content directly in terminal
> analyze [text]      : Run sentiment analysis
> clear               : Clear terminal history
> system status       : Check API and Core health

You can also use natural language: "Take me to the studio" or "Write a tweet about AI"
          `, timestamp: new Date().toLocaleTimeString() }]);
          setIsProcessing(false);
          return;
      }

      const result = await processTerminalCommand(cmd);
      
      if (result.actionType === 'navigate' && result.target) {
          setHistory(prev => [...prev, { type: 'system', content: `EXECUTING JUMP TO: ${result.target.toUpperCase()}...`, timestamp: new Date().toLocaleTimeString() }]);
          setTimeout(() => {
              onNavigate(result.target as Page);
          }, 800);
      } else {
          setHistory(prev => [...prev, { type: 'output', content: result.data || 'Command executed.', timestamp: new Date().toLocaleTimeString() }]);
      }
      
      setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleCommand();
  };

  return (
    <div className="h-full bg-black rounded-xl border-2 border-slate-800 p-4 font-mono text-sm relative overflow-hidden flex flex-col shadow-2xl">
        {/* CRT Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
        <div className="absolute inset-0 bg-green-500/5 animate-pulse-slow pointer-events-none z-0"></div>
        
        <div className="flex-1 overflow-y-auto z-20 pb-4 space-y-2 pr-2 custom-scrollbar">
            {history.map((msg, i) => (
                <div key={i} className={`${
                    msg.type === 'input' ? 'text-white font-bold' : 
                    msg.type === 'system' ? 'text-yellow-500' : 
                    msg.type === 'error' ? 'text-red-500' : 'text-green-400'
                }`}>
                    <span className="opacity-50 mr-3 text-xs">[{msg.timestamp}]</span>
                    {msg.type === 'input' && <span className="text-blue-400 mr-2">$</span>}
                    {msg.type === 'system' && <span className="text-yellow-500 mr-2">#</span>}
                    {msg.type === 'output' && <span className="text-green-500 mr-2">{'>'}</span>}
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                </div>
            ))}
            {isProcessing && (
                <div className="text-green-400 animate-pulse">
                    <span className="opacity-50 mr-3 text-xs">[{new Date().toLocaleTimeString()}]</span>
                    {'>'} Processing...
                </div>
            )}
            <div ref={scrollRef}></div>
        </div>

        <div className="flex items-center gap-2 z-20 border-t border-slate-800 pt-2">
            <span className="text-blue-400 font-bold">$</span>
            <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-slate-700"
                placeholder="Enter command..."
                autoFocus
            />
        </div>
    </div>
  );
};
