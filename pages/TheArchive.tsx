import React, { useState, useEffect } from 'react';
import { NeuralEvent } from '../types';

export const TheArchive: React.FC = () => {
  const [events, setEvents] = useState<NeuralEvent[]>([]);
  const [filter, setFilter] = useState<NeuralEvent['type'] | 'All'>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
      const loadArchive = () => {
          const stored = localStorage.getItem('elevate_neural_archive');
          if (stored) {
              setEvents(JSON.parse(stored));
          }
      };
      loadArchive();
      
      // Refresh archive if localStorage changes (for multi-tab or simulated events)
      window.addEventListener('storage', loadArchive);
      return () => window.removeEventListener('storage', loadArchive);
  }, []);

  const filteredEvents = events.filter(ev => {
      const matchesType = filter === 'All' || ev.type === filter;
      const matchesSearch = ev.summary.toLowerCase().includes(search.toLowerCase()) || 
                           ev.module.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
  });

  const getEventIcon = (type: NeuralEvent['type']) => {
      switch(type) {
          case 'Generation': return 'fa-wand-magic-sparkles text-indigo-400';
          case 'Analysis': return 'fa-magnifying-glass-chart text-cyan-400';
          case 'Decision': return 'fa-gavel text-amber-400';
          case 'System': return 'fa-microchip text-slate-400';
          default: return 'fa-circle';
      }
  };

  const getModuleIcon = (module: string) => {
      switch(module) {
          case 'studio': return 'fa-pen-nib';
          case 'scheduler': return 'fa-calendar';
          case 'syndicate': return 'fa-users-viewfinder';
          case 'sentinel': return 'fa-crosshairs';
          default: return 'fa-layer-group';
      }
  };

  return (
    <div className="h-full flex flex-col gap-6">
        {/* Header & Filters */}
        <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <i className="fa-solid fa-box-archive text-slate-400"></i> The Archive
                </h2>
                <p className="text-sm text-muted">High-fidelity history of the Neural Core.</p>
            </div>

            <div className="flex-1 w-full md:max-w-md flex gap-2">
                <input 
                    type="text" 
                    placeholder="Search events..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:border-slate-400 outline-none"
                />
                <select 
                    value={filter}
                    onChange={e => setFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-slate-400 outline-none"
                >
                    <option value="All">All Types</option>
                    <option value="Generation">Generation</option>
                    <option value="Analysis">Analysis</option>
                    <option value="Decision">Decision</option>
                </select>
            </div>
        </div>

        {/* Timeline Scroll */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-y-auto relative p-8">
            {filteredEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted opacity-30">
                    <i className="fa-solid fa-ghost text-6xl mb-4"></i>
                    <p>No neural records found.</p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-0 bottom-0 w-px bg-slate-800"></div>

                    {filteredEvents.map((ev, i) => (
                        <div key={ev.id} className="flex gap-6 animate-fade-in-up" style={{animationDelay: `${i * 50}ms`}}>
                            {/* Icon Node */}
                            <div className="relative z-10 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-xl">
                                <i className={`fa-solid ${getEventIcon(ev.type)}`}></i>
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 bg-surface border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition-colors shadow-lg">
                                <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <i className={`fa-solid ${getModuleIcon(ev.module)} text-xs text-slate-500`}></i>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ev.module}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-600">{new Date(ev.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="p-5">
                                    <h4 className="font-bold text-white mb-2">{ev.summary}</h4>
                                    <div className="bg-black/20 rounded-lg p-3 border border-slate-800 text-xs text-slate-400 font-mono line-clamp-3 hover:line-clamp-none transition-all">
                                        {ev.content}
                                    </div>
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">Resurrect Asset</button>
                                        <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">Metadata</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
