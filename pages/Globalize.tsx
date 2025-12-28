import React, { useState } from 'react';
import { localizeContent } from '../services/geminiService';
import { LocalizationResult } from '../types';

const REGIONS = [
    { id: 'Japan (Formal)', flag: '🇯🇵' },
    { id: 'Brazil (Energetic)', flag: '🇧🇷' },
    { id: 'France (Chic)', flag: '🇫🇷' },
    { id: 'USA (Gen Z)', flag: '🇺🇸' },
    { id: 'UAE (Business)', flag: '🇦🇪' },
    { id: 'Germany (Professional)', flag: '🇩🇪' },
    { id: 'Korea (Trendy)', flag: '🇰🇷' },
    { id: 'Spain (Casual)', flag: '🇪🇸' },
];

export const Globalize: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<LocalizationResult[]>([]);

  const toggleRegion = (id: string) => {
      setSelectedRegions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleGlobalize = async () => {
      if (!sourceText || selectedRegions.length === 0) return;
      setIsProcessing(true);
      setResults([]);
      const data = await localizeContent(sourceText, selectedRegions);
      setResults(data);
      setIsProcessing(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       {/* Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-earth-asia text-blue-400"></i> Globalize Studio
                </h2>
                <p className="text-sm text-muted">Use Gemini to "transcreate" content for international markets, adapting culture and tone.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase text-muted tracking-wider">1. Source Content (English)</label>
                    <textarea 
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Paste your post text here..."
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm focus:border-blue-500 outline-none resize-none shadow-inner"
                    />
                </div>
                
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase text-muted tracking-wider">2. Target Markets</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {REGIONS.map(r => (
                            <button
                                key={r.id}
                                onClick={() => toggleRegion(r.id)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                                    selectedRegions.includes(r.id)
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                <span>{r.flag}</span>
                                {r.id}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleGlobalize}
                        disabled={isProcessing || !sourceText || selectedRegions.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Transcreating...</> : 'Globalize Content'}
                    </button>
                </div>
            </div>
       </div>

       {/* Results Grid */}
       <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                <h3 className="font-bold text-sm text-slate-300">Localization Results</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {!results.length && !isProcessing ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                        <i className="fa-solid fa-language text-6xl mb-4"></i>
                        <p>Select regions and generate to see adapted content.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {results.map((res, idx) => (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all flex flex-col animate-fade-in" style={{animationDelay: `${idx * 100}ms`}}>
                                <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                                    <h4 className="font-bold text-white text-sm">{res.region}</h4>
                                    <span className="text-xs text-muted bg-slate-800 px-2 py-1 rounded">{res.language}</span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col gap-4">
                                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{res.content}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-700/50 space-y-3">
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                                            <p className="text-[10px] font-bold text-indigo-300 uppercase mb-1 flex items-center gap-1">
                                                <i className="fa-solid fa-lightbulb"></i> Cultural Insight
                                            </p>
                                            <p className="text-xs text-indigo-200/80 italic leading-tight">"{res.culturalNotes}"</p>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {res.hashtags.map(tag => (
                                                <span key={tag} className="text-[10px] text-blue-300 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                                    <button className="text-xs text-muted hover:text-white px-3 py-1 transition-colors flex items-center gap-1">
                                        <i className="fa-regular fa-copy"></i> Copy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};