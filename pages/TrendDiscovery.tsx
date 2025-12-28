import React, { useState } from 'react';
import { searchTrends } from '../services/geminiService';
import { SearchResult } from '../types';

interface TrendDiscoveryProps {
  onDraftPost: (topic: string) => void;
}

const SUGGESTED_TOPICS = [
  "Latest AI Developments",
  "Tech Industry Layoffs vs Hiring",
  "Sustainable Energy Breakthroughs",
  "Viral Social Media Challenges",
  "Crypto Market Trends"
];

export const TrendDiscovery: React.FC<TrendDiscoveryProps> = ({ onDraftPost }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (term: string) => {
    if (!term) return;
    setQuery(term);
    setIsSearching(true);
    setResult(null);
    const data = await searchTrends(term);
    setResult(data);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(query);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Search Header */}
      <div className="bg-surface rounded-xl border border-slate-700 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"></div>
        <div className="relative z-10 w-full max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-2">Discover What's Trending</h2>
            <p className="text-muted mb-6">Real-time search grounding to find the latest stories for your audience.</p>
            
            <div className="relative">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for a topic (e.g. 'SpaceX Launch', 'New iPhone rumors')..."
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-full py-4 px-6 pl-12 text-sm focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none shadow-xl transition-all"
                />
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted"></i>
                <button 
                    onClick={() => handleSearch(query)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-indigo-600 text-white rounded-full px-6 py-2 text-xs font-bold transition-colors"
                >
                    {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Search'}
                </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {SUGGESTED_TOPICS.map(topic => (
                    <button 
                        key={topic}
                        onClick={() => handleSearch(topic)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-xs text-muted hover:text-white transition-colors"
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Main Summary */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <i className="fa-solid fa-align-left text-primary"></i>
                    Insight Summary
                </h3>
                {result && (
                    <button 
                        onClick={() => onDraftPost(`Write a post about: ${result.summary}`)}
                        className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/50 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-pen-nib"></i>
                        Draft Post
                    </button>
                )}
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-slate-900/30">
                {isSearching ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted space-y-4">
                        <i className="fa-solid fa-earth-americas fa-spin text-4xl text-slate-700"></i>
                        <p>Scanning the web for real-time insights...</p>
                    </div>
                ) : result ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 leading-relaxed text-slate-200">
                             {result.summary.split('\n').map((line, i) => (
                                <p key={i} className="mb-4 last:mb-0">{line}</p>
                             ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted">
                        <i className="fa-solid fa-magnifying-glass-chart text-4xl text-slate-700 mb-4"></i>
                        <p>Search for a topic to see an AI-generated summary.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Sources */}
        <div className="bg-surface rounded-xl border border-slate-700 flex flex-col overflow-hidden">
             <div className="p-6 border-b border-slate-700">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <i className="fa-solid fa-link text-accent"></i>
                    Sources
                </h3>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {isSearching ? (
                   [1,2,3].map(i => (
                       <div key={i} className="h-20 bg-slate-800 rounded-lg animate-pulse"></div>
                   ))
                ) : result?.sources && result.sources.length > 0 ? (
                    result.sources.map((source, idx) => (
                        <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-all group"
                        >
                            <h4 className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 line-clamp-2 mb-1">
                                {source.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted truncate">
                                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                <span className="truncate">{source.uri}</span>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="text-center text-muted text-sm py-10">
                        {result ? 'No direct sources cited.' : 'Sources will appear here.'}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};