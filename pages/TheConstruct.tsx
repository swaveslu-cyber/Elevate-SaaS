import React, { useState, useRef, useEffect } from 'react';
import { generateMicroApp, refineMicroApp } from '../services/geminiService';

export const TheConstruct: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
      if (!input.trim()) return;
      const instruction = input;
      setInput('');
      
      setMessages(prev => [...prev, { role: 'user', text: instruction }]);
      setIsBuilding(true);

      if (!generatedCode) {
          // Initial Build
          const code = await generateMicroApp(instruction);
          setGeneratedCode(code);
          setMessages(prev => [...prev, { role: 'ai', text: "I've constructed the initial prototype based on your specifications." }]);
      } else {
          // Refinement
          const code = await refineMicroApp(generatedCode, instruction);
          setGeneratedCode(code);
          setMessages(prev => [...prev, { role: 'ai', text: "Updated the construct. How does it look?" }]);
      }
      
      setIsBuilding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };

  const downloadAsset = () => {
      if (!generatedCode) return;
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'micro-app.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
        
        {/* Left: Chat Interface */}
        <div className="lg:w-1/3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-emerald-500 font-mono flex items-center gap-2">
                    <i className="fa-solid fa-code"></i> THE CONSTRUCT
                </h2>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    Active Session
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-6">
                        <i className="fa-solid fa-cube text-4xl mb-4 opacity-50"></i>
                        <p className="text-sm font-mono mb-2">Initialize Construction</p>
                        <p className="text-xs text-slate-500">Describe a tool, calculator, or dashboard to build.</p>
                        <div className="mt-6 grid grid-cols-1 gap-2 w-full">
                            <button onClick={() => setInput("Build a futuristic ROI calculator for SaaS")} className="text-xs bg-slate-900 border border-slate-800 p-2 rounded hover:border-emerald-500/50 transition-colors text-left">
                                "Build a futuristic ROI calculator"
                            </button>
                            <button onClick={() => setInput("Create a brand archetype quiz")} className="text-xs bg-slate-900 border border-slate-800 p-2 rounded hover:border-emerald-500/50 transition-colors text-left">
                                "Create a brand archetype quiz"
                            </button>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-xl text-xs font-mono leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-emerald-900/20 text-emerald-100 border border-emerald-500/20' 
                                : 'bg-slate-900 text-slate-300 border border-slate-700'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                {isBuilding && (
                    <div className="flex justify-start">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center gap-2">
                            <i className="fa-solid fa-circle-notch fa-spin text-emerald-500 text-xs"></i>
                            <span className="text-xs text-slate-400 font-mono">Compiling...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="relative">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={generatedCode ? "Refine (e.g. 'Make the buttons red')" : "Describe app to build..."}
                        className="w-full bg-black border border-slate-700 rounded-lg p-3 pr-10 text-emerald-100 font-mono text-sm focus:border-emerald-500 outline-none resize-none h-12 max-h-32 transition-all shadow-inner"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input || isBuilding}
                        className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>

        {/* Right: Render / Code View */}
        <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col relative shadow-2xl">
            <div className="p-3 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === 'preview' ? 'bg-slate-600 text-white' : 'text-muted hover:text-white'}`}
                    >
                        <i className="fa-solid fa-play mr-1"></i> Preview
                    </button>
                    <button 
                        onClick={() => setViewMode('code')}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === 'code' ? 'bg-slate-600 text-white' : 'text-muted hover:text-white'}`}
                    >
                        <i className="fa-solid fa-code mr-1"></i> Source
                    </button>
                </div>
                {generatedCode && (
                    <button onClick={downloadAsset} className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded font-bold border border-emerald-500/30 transition-colors flex items-center gap-1">
                        <i className="fa-solid fa-download"></i> Export HTML
                    </button>
                )}
            </div>

            <div className="flex-1 bg-white relative">
                {!generatedCode ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-600">
                        <div className="w-24 h-24 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center mb-4">
                            <i className="fa-solid fa-hammer text-4xl opacity-20"></i>
                        </div>
                        <p className="font-mono text-sm">Awaiting blueprints...</p>
                    </div>
                ) : viewMode === 'preview' ? (
                    <iframe 
                        srcDoc={generatedCode}
                        className="w-full h-full border-none"
                        title="Construct Preview"
                        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-900 p-4 overflow-auto">
                        <pre className="text-xs text-emerald-100 font-mono whitespace-pre-wrap">
                            {generatedCode}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};