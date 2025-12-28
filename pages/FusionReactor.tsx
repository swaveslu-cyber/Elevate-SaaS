import React, { useState } from 'react';
import { fuseElements } from '../services/geminiService';
import { FusionElement, FusionResult } from '../types';

const INITIAL_ELEMENTS: FusionElement[] = [
    { id: 't1', type: 'trend', label: 'AI Revolution', icon: 'fa-robot', color: 'border-blue-500 text-blue-400' },
    { id: 't2', type: 'trend', label: 'Remote Work', icon: 'fa-laptop-house', color: 'border-blue-500 text-blue-400' },
    { id: 't3', type: 'trend', label: 'Sustainability', icon: 'fa-leaf', color: 'border-emerald-500 text-emerald-400' },
    
    { id: 'p1', type: 'persona', label: 'Gen Z Gamers', icon: 'fa-gamepad', color: 'border-pink-500 text-pink-400' },
    { id: 'p2', type: 'persona', label: 'Corporate CTOs', icon: 'fa-user-tie', color: 'border-slate-400 text-slate-200' },
    { id: 'p3', type: 'persona', label: 'Fitness Freaks', icon: 'fa-dumbbell', color: 'border-orange-500 text-orange-400' },
    
    { id: 'f1', type: 'format', label: 'Twitter Thread', icon: 'fa-layer-group', color: 'border-indigo-500 text-indigo-400' },
    { id: 'f2', type: 'format', label: 'Meme Concept', icon: 'fa-face-grin-squint', color: 'border-yellow-500 text-yellow-400' },
    { id: 'f3', type: 'format', label: 'LinkedIn Article', icon: 'fa-newspaper', color: 'border-blue-600 text-blue-300' },
    
    { id: 'm1', type: 'modifier', label: 'Sarcastic', icon: 'fa-face-rolling-eyes', color: 'border-red-500 text-red-400' },
    { id: 'm2', type: 'modifier', label: 'Inspirational', icon: 'fa-mountain-sun', color: 'border-cyan-500 text-cyan-400' },
];

export const FusionReactor: React.FC = () => {
  const [coreItems, setCoreItems] = useState<FusionElement[]>([]);
  const [results, setResults] = useState<FusionResult[]>([]);
  const [isFusing, setIsFusing] = useState(false);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, item: FusionElement) => {
      e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('application/json');
      if (data) {
          const item = JSON.parse(data) as FusionElement;
          // Avoid dupes by ID
          if (!coreItems.find(i => i.id === item.id)) {
              setCoreItems([...coreItems, item]);
          }
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const removeFromCore = (id: string) => {
      setCoreItems(coreItems.filter(i => i.id !== id));
  };

  const handleIgnite = async () => {
      if (coreItems.length < 2) return;
      setIsFusing(true);
      setResults([]);
      
      const fusionResults = await fuseElements(coreItems);
      setResults(fusionResults);
      setIsFusing(false);
  };

  return (
    <div className="h-full flex gap-6">
       
       {/* Inventory Sidebar */}
       <div className="w-64 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="font-bold text-sm text-muted uppercase tracking-wider">Element Inventory</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {INITIAL_ELEMENTS.map(item => (
                    <div 
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className={`p-3 rounded-lg border bg-slate-900/50 cursor-grab hover:bg-slate-800 transition-colors flex items-center gap-3 ${item.color}`}
                    >
                        <i className={`fa-solid ${item.icon}`}></i>
                        <span className="text-sm font-medium text-slate-200">{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-slate-900/30 text-xs text-center text-muted border-t border-slate-700">
                Drag items to the Core
            </div>
       </div>

       {/* The Reactor Core */}
       <div className="flex-1 flex flex-col gap-6 relative">
            
            {/* Drop Zone */}
            <div 
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="flex-1 bg-black/20 border-2 border-dashed border-slate-700 rounded-xl relative flex flex-col items-center justify-center transition-all hover:border-indigo-500/50 overflow-hidden"
            >
                {/* Background Reactor Effect */}
                <div className={`absolute w-96 h-96 rounded-full blur-[100px] transition-all duration-1000 ${
                    isFusing 
                    ? 'bg-indigo-500/40 animate-pulse scale-110' 
                    : coreItems.length > 0 ? 'bg-indigo-900/20' : 'bg-transparent'
                }`}></div>

                {/* Core Circle */}
                <div className={`relative z-10 w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                    isFusing 
                    ? 'border-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.6)] animate-spin-slow' 
                    : coreItems.length > 0 ? 'border-indigo-500/50 bg-slate-900/50' : 'border-slate-700 bg-slate-900/30'
                }`}>
                    {coreItems.length === 0 ? (
                        <div className="text-center text-muted">
                            <i className="fa-solid fa-atom text-4xl mb-2 block"></i>
                            <span className="text-sm font-bold uppercase tracking-wider">Reactor Idle</span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <span className="text-3xl font-bold text-white">{coreItems.length}</span>
                            <span className="block text-xs text-indigo-300 uppercase mt-1">Elements Loaded</span>
                        </div>
                    )}
                </div>

                {/* Floating Items in Core */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {coreItems.map((item, i) => {
                        // Simple circular distribution logic
                        const angle = (i / coreItems.length) * 2 * Math.PI;
                        const radius = 160; // Distance from center
                        const x = 50 + (Math.cos(angle) * 20); // % approximate
                        const y = 50 + (Math.sin(angle) * 20); // % approximate
                        
                        return (
                            <div 
                                key={item.id}
                                style={{ left: `${x}%`, top: `${y}%` }}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto bg-slate-900 border ${item.color} px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-fade-in`}
                            >
                                <i className={`fa-solid ${item.icon}`}></i>
                                {item.label}
                                <button onClick={() => removeFromCore(item.id)} className="ml-1 hover:text-red-400"><i className="fa-solid fa-times"></i></button>
                            </div>
                        );
                    })}
                </div>

                {/* Ignition Button */}
                <div className="absolute bottom-8 z-30">
                    <button 
                        onClick={handleIgnite}
                        disabled={isFusing || coreItems.length < 2}
                        className={`px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 ${
                            isFusing 
                            ? 'bg-indigo-600 text-white cursor-wait' 
                            : coreItems.length >= 2 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/50' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {isFusing ? 'FUSING...' : 'IGNITE CORE'}
                    </button>
                </div>
            </div>

            {/* Results Panel (Slides up or appears) */}
            {results.length > 0 && (
                <div className="h-1/3 bg-surface border border-slate-700 rounded-xl p-6 overflow-y-auto animate-fade-in-up">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-flask text-indigo-400"></i> Fused Concepts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {results.map((res, idx) => (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl hover:border-indigo-500/30 transition-colors group">
                                <h4 className="font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{res.title}</h4>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-4 hover:line-clamp-none transition-all">{res.content}</p>
                                <div className="text-xs text-muted italic bg-slate-900/50 p-2 rounded">
                                    <span className="font-bold not-italic text-indigo-400">Why:</span> {res.rationale}
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <button className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded transition-colors shadow">
                                        Use Concept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};
