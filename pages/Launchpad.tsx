import React, { useState } from 'react';
import { generateLaunchSequence } from '../services/geminiService';
import { LaunchSequence, LaunchDay } from '../types';

export const Launchpad: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [launchSequence, setLaunchSequence] = useState<LaunchSequence | null>(null);
  const [selectedDay, setSelectedDay] = useState<LaunchDay | null>(null);

  const handleGenerate = async () => {
      if (!productName || !goal) return;
      setIsGenerating(true);
      setLaunchSequence(null);
      setSelectedDay(null);
      
      const sequence = await generateLaunchSequence(productName, duration, goal);
      if (sequence) {
          setLaunchSequence(sequence);
          if (sequence.days.length > 0) setSelectedDay(sequence.days[0]);
      }
      setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Mission Config */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2 text-white">
                <i className="fa-solid fa-rocket text-red-500"></i> The Launchpad
            </h2>
            <p className="text-sm text-muted mb-6">Mission Control for high-impact product launches and campaigns.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-muted uppercase mb-2">Product / Offer</label>
                    <input 
                        type="text" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. 'Advanced React Course'"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-red-500 outline-none"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-muted uppercase mb-2">Goal</label>
                    <input 
                        type="text" 
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g. '$10k Sales in 5 days'"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-red-500 outline-none"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-muted uppercase mb-2">Duration: {duration} Days</label>
                    <input 
                        type="range" 
                        min="3" max="14" 
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                </div>
                <div className="md:col-span-1">
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !productName}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Initiate Sequence'}
                    </button>
                </div>
            </div>
       </div>

       {/* Sequence Visualizer */}
       <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col relative">
            {!launchSequence ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50">
                    <i className="fa-solid fa-shuttle-space text-6xl mb-4"></i>
                    <p>Configure mission parameters to generate flight plan.</p>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Timeline (Top) */}
                    <div className="h-32 bg-slate-900 border-b border-slate-700 p-4 flex items-center overflow-x-auto space-x-4 custom-scrollbar">
                        {launchSequence.days.map((day) => (
                            <button
                                key={day.day}
                                onClick={() => setSelectedDay(day)}
                                className={`flex-shrink-0 w-32 h-24 rounded-xl border flex flex-col items-center justify-center p-2 transition-all relative ${
                                    selectedDay?.day === day.day 
                                    ? 'bg-red-900/30 border-red-500 shadow-lg scale-105 z-10' 
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-muted'
                                }`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider mb-1">Day {day.day}</span>
                                <span className={`text-xs font-bold text-center line-clamp-2 ${selectedDay?.day === day.day ? 'text-white' : 'text-slate-400'}`}>
                                    {day.phase}
                                </span>
                                {selectedDay?.day === day.day && (
                                    <div className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-red-500"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Detail Content (Bottom) */}
                    {selectedDay && (
                        <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{selectedDay.title}</h3>
                                        <div className="flex gap-3 text-sm">
                                            <span className="text-red-400 font-bold">{selectedDay.phase}</span>
                                            <span className="text-slate-500">•</span>
                                            <span className="text-muted">{selectedDay.channel}</span>
                                        </div>
                                    </div>
                                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                                        Edit
                                    </button>
                                </div>

                                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Strategic Intent</h4>
                                    <p className="text-sm text-slate-300 italic">"{selectedDay.strategy}"</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Content Draft</h4>
                                        <button 
                                            onClick={() => copyToClipboard(selectedDay.content)}
                                            className="text-xs text-red-400 hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            <i className="fa-regular fa-copy"></i> Copy
                                        </button>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                                        {selectedDay.content}
                                    </div>
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