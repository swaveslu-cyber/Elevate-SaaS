
import React, { useState } from 'react';
import { generateNarrativeArc } from '../services/geminiService';
import { NarrativeArc, StoryBeat } from '../types';

export const TheHorizon: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('4 Weeks');
  const [isGenerating, setIsGenerating] = useState(false);
  const [arc, setArc] = useState<NarrativeArc | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<StoryBeat | null>(null);

  const handleGenerate = async () => {
      if (!goal) return;
      setIsGenerating(true);
      setArc(null);
      setSelectedBeat(null);
      const result = await generateNarrativeArc(goal, duration);
      setArc(result);
      setIsGenerating(false);
  };

  const copyContent = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row justify-between items-end gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-pink-900/20 pointer-events-none"></div>
            
            <div className="relative z-10 w-full md:max-w-2xl space-y-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-mountain-sun text-orange-500"></i> The Horizon
                    </h2>
                    <p className="text-sm text-muted">Architect long-range narrative arcs and campaigns.</p>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="Define your Narrative Goal (e.g. 'Establish authority in AI Ethics', 'Launch Summer Collection')..."
                        className="flex-1 bg-slate-900/80 border border-slate-600 rounded-lg py-3 px-4 text-sm focus:border-orange-500 outline-none shadow-inner"
                    />
                    <select 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="bg-slate-900/80 border border-slate-600 rounded-lg px-4 text-sm focus:border-orange-500 outline-none"
                    >
                        <option>2 Weeks</option>
                        <option>4 Weeks</option>
                        <option>8 Weeks</option>
                        <option>3 Months</option>
                    </select>
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !goal}
                        className="px-6 bg-gradient-to-r from-orange-600 to-pink-600 hover:opacity-90 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Plot Course'}
                    </button>
                </div>
            </div>
        </div>

        {/* Narrative Map */}
        <div className="flex-1 bg-slate-950 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col">
            {!arc ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-route text-6xl mb-4"></i>
                    <p className="text-lg">Waiting for strategic coordinates.</p>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Summary Header */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded">Active Arc</span>
                            <h3 className="font-bold text-white text-lg">{arc.title}</h3>
                        </div>
                        <p className="text-sm text-slate-400 max-w-3xl">{arc.summary}</p>
                    </div>

                    {/* Timeline Visualization */}
                    <div className="flex-1 relative overflow-x-auto overflow-y-hidden bg-slate-950 p-8 flex items-center">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-orange-900 via-pink-900 to-indigo-900 transform -translate-y-1/2 z-0"></div>
                        
                        <div className="flex gap-12 relative z-10 px-12 min-w-max">
                            {arc.beats?.map((beat, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedBeat(beat)}
                                    className={`relative group cursor-pointer transition-all duration-300 transform ${selectedBeat === beat ? 'scale-110 -translate-y-2' : 'hover:-translate-y-1'}`}
                                >
                                    {/* Node */}
                                    <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center bg-slate-900 shadow-2xl relative z-20 ${
                                        selectedBeat === beat 
                                        ? 'border-orange-500 shadow-orange-500/50' 
                                        : 'border-slate-700 group-hover:border-orange-400'
                                    }`}>
                                        <span className="text-xl font-bold text-white">{idx + 1}</span>
                                    </div>
                                    
                                    {/* Label */}
                                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 text-center">
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                                            selectedBeat === beat ? 'text-orange-400' : 'text-slate-500 group-hover:text-slate-300'
                                        }`}>
                                            {beat.phase}
                                        </p>
                                        <p className={`text-sm font-bold leading-tight ${
                                            selectedBeat === beat ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                        }`}>
                                            {beat.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Beat Detail Panel (Bottom Sheet) */}
                    {selectedBeat && (
                        <div className="h-64 bg-slate-900 border-t border-slate-700 p-6 animate-fade-in-up flex gap-8">
                            <div className="w-1/3 border-r border-slate-800 pr-8">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Strategic Objective</h4>
                                <p className="text-lg text-white font-medium mb-4">{selectedBeat.objective}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted">Target Emotion:</span>
                                    <span className="px-2 py-1 bg-pink-900/30 text-pink-400 border border-pink-500/30 rounded text-xs font-bold uppercase">
                                        {selectedBeat.emotion}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Content Prompt</h4>
                                    <button 
                                        onClick={() => copyContent(selectedBeat.contentIdea)}
                                        className="text-xs text-orange-400 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <i className="fa-regular fa-copy"></i> Copy
                                    </button>
                                </div>
                                <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 p-4 overflow-y-auto">
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedBeat.contentIdea}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
