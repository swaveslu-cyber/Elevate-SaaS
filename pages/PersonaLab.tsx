import React, { useState, useEffect } from 'react';
import { generatePersonas, askPersona } from '../services/geminiService';
import { Persona } from '../types';

export const PersonaLab: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  
  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'persona', text: string}[]>([]);

  // Load from local storage
  useEffect(() => {
      const stored = localStorage.getItem('elevate_personas');
      if (stored) {
          setPersonas(JSON.parse(stored));
      }
  }, []);

  // Save to local storage
  useEffect(() => {
      if (personas.length > 0) {
          localStorage.setItem('elevate_personas', JSON.stringify(personas));
      }
  }, [personas]);

  const handleGenerate = async () => {
      if (!targetAudience) return;
      setIsGenerating(true);
      const newPersonas = await generatePersonas(targetAudience);
      setPersonas(newPersonas);
      setIsGenerating(false);
      setTargetAudience('');
  };

  const handleSelectPersona = (p: Persona) => {
      setSelectedPersona(p);
      setChatHistory([]); // Reset chat for new persona
  };

  const handleSendMessage = async () => {
      if (!chatMessage || !selectedPersona) return;
      
      const userMsg = chatMessage;
      setChatMessage('');
      setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
      setIsChatting(true);

      const response = await askPersona(selectedPersona, userMsg);
      
      setChatHistory(prev => [...prev, { sender: 'persona', text: response }]);
      setIsChatting(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
        {/* Header */}
        <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fa-solid fa-users-rays text-pink-500"></i> Persona Lab
                </h2>
                <p className="text-sm text-muted">Generate and interrogate your target audience using AI simulation.</p>
            </div>

            <div className="flex w-full md:max-w-lg gap-2">
                <input 
                    type="text" 
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Describe your niche (e.g. 'Gen Z Gamers', 'Corporate HR Managers')..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 text-sm focus:border-pink-500 outline-none"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !targetAudience}
                    className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg disabled:opacity-50 min-w-[100px]"
                >
                    {isGenerating ? <i className="fa-solid fa-dna fa-spin"></i> : 'Create'}
                </button>
            </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Persona List */}
            <div className={`transition-all duration-300 flex flex-col gap-4 overflow-y-auto ${selectedPersona ? 'w-1/3 hidden md:flex' : 'w-full'}`}>
                {personas.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                        <i className="fa-solid fa-user-group text-6xl mb-4"></i>
                        <p>No personas generated yet.</p>
                    </div>
                ) : (
                    personas.map(persona => (
                        <div 
                            key={persona.id}
                            onClick={() => handleSelectPersona(persona)}
                            className={`bg-surface border p-6 rounded-xl cursor-pointer hover:border-pink-500/50 transition-all group relative overflow-hidden ${
                                selectedPersona?.id === persona.id ? 'border-pink-500 ring-1 ring-pink-500' : 'border-slate-700'
                            }`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <i className="fa-solid fa-fingerprint text-6xl"></i>
                            </div>
                            <div className="flex items-start gap-4 relative z-10">
                                <img src={persona.avatarUrl} alt={persona.name} className="w-16 h-16 rounded-full border-2 border-slate-600" />
                                <div>
                                    <h3 className="font-bold text-lg text-white">{persona.name}</h3>
                                    <p className="text-sm text-pink-400 font-medium">{persona.age} • {persona.occupation}</p>
                                    <p className="text-xs text-muted mt-2 line-clamp-2">{persona.bio}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                                {persona.platforms.slice(0, 3).map(p => (
                                    <span key={p} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">{p}</span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat / Details View */}
            {selectedPersona && (
                <div className="flex-1 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden animate-fade-in relative">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src={selectedPersona.avatarUrl} alt="Av" className="w-10 h-10 rounded-full" />
                            <div>
                                <h3 className="font-bold text-sm">{selectedPersona.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-xs text-muted">Online • Simulating</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedPersona(null)} className="md:hidden text-muted">Back</button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/30">
                        {chatHistory.length === 0 ? (
                            <div className="text-center space-y-6 mt-10">
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 inline-block max-w-md text-left">
                                    <h4 className="text-xs font-bold text-muted uppercase mb-3">Persona Profile</h4>
                                    <div className="space-y-2 text-sm text-slate-300">
                                        <p><strong className="text-pink-400">Goals:</strong> {selectedPersona.goals.join(', ')}</p>
                                        <p><strong className="text-red-400">Frustrations:</strong> {selectedPersona.painPoints.join(', ')}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted">Ask {selectedPersona.name} anything about your product or content.</p>
                            </div>
                        ) : (
                            chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                                        msg.sender === 'user' 
                                        ? 'bg-primary text-white rounded-tr-none' 
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {isChatting && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-700 flex gap-1">
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-slate-800 border-t border-slate-700">
                        <div className="relative">
                            <input 
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={`Ask ${selectedPersona.name} a question...`}
                                className="w-full bg-slate-900 border border-slate-600 rounded-full py-3 px-5 pr-12 text-sm focus:border-pink-500 outline-none"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!chatMessage || isChatting}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-pink-600 hover:bg-pink-500 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                            >
                                <i className="fa-solid fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};