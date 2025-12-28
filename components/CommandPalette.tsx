import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import { quickAssistant } from '../services/geminiService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
}

interface Command {
  id: string;
  label: string;
  icon: string;
  page?: Page;
  action?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMANDS: Command[] = [
    { id: 'dash', label: 'Go to Dashboard', icon: 'fa-chart-line', page: 'dashboard' },
    { id: 'syndicate', label: 'The Syndicate (Collaboration)', icon: 'fa-users-viewfinder', page: 'syndicate' },
    { id: 'frequency', label: 'The Frequency (Audio Studio)', icon: 'fa-wave-square', page: 'frequency' },
    { id: 'director', label: 'The Director (Video Editor)', icon: 'fa-clapperboard', page: 'director' },
    { id: 'quantum', label: 'Quantum Feed (Generate Futures)', icon: 'fa-atom', page: 'quantum' },
    { id: 'loom', label: 'The Loom (Synthesis Engine)', icon: 'fa-scroll', page: 'loom' },
    { id: 'biome', label: 'The Biome (Ecosystem Health)', icon: 'fa-seedling', page: 'biome' },
    { id: 'oracle', label: 'The Oracle (Strategic Forecasting)', icon: 'fa-eye', page: 'oracle' },
    { id: 'construct', label: 'The Construct (Micro-App Builder)', icon: 'fa-code', page: 'construct' },
    { id: 'hive', label: 'The Hive (Swarm Intelligence)', icon: 'fa-users-gear', page: 'hive' },
    { id: 'codex', label: 'The Codex (Knowledge Base)', icon: 'fa-book-journal-whills', page: 'codex' },
    { id: 'verdict', label: 'The Verdict (A/B Prediction)', icon: 'fa-gavel', page: 'verdict' },
    { id: 'resonator', label: 'The Resonator (Audience Tuner)', icon: 'fa-volume-high', page: 'resonator' },
    { id: 'kaleidoscope', label: 'The Kaleidoscope (Culture Remix)', icon: 'fa-fan', page: 'kaleidoscope' },
    { id: 'mosaic', label: 'The Mosaic (UGC Engine)', icon: 'fa-border-all', page: 'mosaic' },
    { id: 'cartographer', label: 'The Cartographer (Journey Mapping)', icon: 'fa-map-marked-alt', page: 'cartographer' },
    { id: 'catalyst', label: 'The Catalyst (Growth Experiments)', icon: 'fa-flask-vial', page: 'catalyst' },
    { id: 'alchemist', label: 'The Alchemist (Content Transmutation)', icon: 'fa-flask', page: 'alchemist' },
    { id: 'negotiator', label: 'The Negotiator (Deal Scripting)', icon: 'fa-handshake', page: 'negotiator' },
    { id: 'stylist', label: 'The Stylist (Visual Identity)', icon: 'fa-palette', page: 'stylist' },
    { id: 'scribe', label: 'The Scribe (Voice Cloning)', icon: 'fa-feather-pointed', page: 'scribe' },
    { id: 'curator', label: 'The Curator (Newsletter Engine)', icon: 'fa-newspaper', page: 'curator' },
    { id: 'showrunner', label: 'The Showrunner (Series Architect)', icon: 'fa-clapperboard', page: 'showrunner' },
    { id: 'storyboard', label: 'The Storyboard (Visual Sequence)', icon: 'fa-film', page: 'storyboard' },
    { id: 'academy', label: 'The Academy (Course Architect)', icon: 'fa-graduation-cap', page: 'academy' },
    { id: 'horizon', label: 'The Horizon (Narrative Arcs)', icon: 'fa-mountain-sun', page: 'horizon' },
    { id: 'deep', label: 'The Deep (Socratic Writing)', icon: 'fa-water', page: 'deep' },
    { id: 'prism', label: 'The Prism (Rhetorical Refraction)', icon: 'fa-shapes', page: 'prism' },
    { id: 'mirror', label: 'The Mirror (Brand Audit)', icon: 'fa-yin-yang', page: 'mirror' },
    { id: 'pitch', label: 'The Pitch (Slide Decks)', icon: 'fa-person-chalkboard', page: 'pitch' },
    { id: 'adrenaline', label: 'Adrenaline (Ad Creator)', icon: 'fa-bolt', page: 'adrenaline' },
    { id: 'blueprint', label: 'The Blueprint (Funnels)', icon: 'fa-compass-drafting', page: 'blueprint' },
    { id: 'launchpad', label: 'The Launchpad (Campaigns)', icon: 'fa-rocket', page: 'launchpad' },
    { id: 'circle', label: 'The Inner Circle (CRM)', icon: 'fa-users-line', page: 'circle' },
    { id: 'dojo', label: 'The Dojo (Training)', icon: 'fa-user-ninja', page: 'dojo' },
    { id: 'capsule', label: 'Time Capsule (Content Recycling)', icon: 'fa-clock-rotate-left', page: 'capsule' },
    { id: 'nexus', label: 'The Nexus (Network Graph)', icon: 'fa-circle-nodes', page: 'nexus' },
    { id: 'dna', label: 'Viral DNA (Reverse Engineer)', icon: 'fa-dna', page: 'dna' },
    { id: 'fuse', label: 'Fusion Reactor (Create)', icon: 'fa-atom', page: 'fusion' },
    { id: 'board', label: 'The Boardroom (Strategy)', icon: 'fa-people-arrows', page: 'boardroom' },
    { id: 'studio', label: 'Open Content Studio', icon: 'fa-pen-nib', page: 'studio' },
    { id: 'spy', label: 'Competitor Watchtower', icon: 'fa-tower-observation', page: 'competitors' },
    { id: 'multi', label: 'Content Multiplier', icon: 'fa-arrows-split-up-and-left', page: 'multiplier' },
    { id: 'global', label: 'Globalize Studio', icon: 'fa-earth-asia', page: 'globalize' },
    { id: 'flows', label: 'Neural Flows (Automation)', icon: 'fa-network-wired', page: 'flows' },
    { id: 'partner', label: 'Partner Network', icon: 'fa-handshake-simple', page: 'partners' },
    { id: 'persona', label: 'Persona Lab', icon: 'fa-users-rays', page: 'personas' },
    { id: 'research', label: 'Research Lab', icon: 'fa-microscope', page: 'research' },
    { id: 'sched', label: 'View Scheduler', icon: 'fa-calendar-alt', page: 'scheduler' },
    { id: 'inbox', label: 'Check Inbox', icon: 'fa-inbox', page: 'inbox' },
    { id: 'trends', label: 'Discover Trends', icon: 'fa-globe', page: 'trends' },
    { id: 'scout', label: 'Location Scout', icon: 'fa-map-location-dot', page: 'scout' },
    { id: 'ops', label: 'Business Operations', icon: 'fa-briefcase', page: 'ops' },
    { id: 'strat', label: 'Strategy Room', icon: 'fa-headset', page: 'strategy' },
    { id: 'guard', label: 'Brand Guard', icon: 'fa-shield-halved', page: 'brand-guard' },
  ];

  // Filter commands
  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setAiResponse(null);
    }
  }, [isOpen]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands.length > 0 && !aiResponse) {
        // Execute Navigation
        const cmd = filteredCommands[selectedIndex];
        if (cmd.page) onNavigate(cmd.page);
        onClose();
      } else if (query) {
        // Trigger AI if no command matches or user forces it
        handleAskAi();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleAskAi = async () => {
    setIsAiLoading(true);
    const answer = await quickAssistant(query);
    setAiResponse(answer);
    setIsAiLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-surface border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-700">
          <i className="fa-solid fa-terminal text-muted mr-3"></i>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder-slate-500"
            placeholder="Type a command or ask a question..."
            value={query}
            onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
                setAiResponse(null);
            }}
            onKeyDown={handleKeyDown}
          />
          {isAiLoading && <i className="fa-solid fa-circle-notch fa-spin text-primary"></i>}
        </div>

        <div className="max-h-[300px] overflow-y-auto bg-slate-900/50">
          {aiResponse ? (
             <div className="p-4">
                 <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-wide">
                     <i className="fa-solid fa-wand-magic-sparkles"></i> AI Answer
                 </div>
                 <p className="text-slate-200 leading-relaxed text-sm">{aiResponse}</p>
                 <div className="mt-4 flex justify-end">
                     <button onClick={() => setAiResponse(null)} className="text-xs text-muted hover:text-white">Clear</button>
                 </div>
             </div>
          ) : (
            <>
               {filteredCommands.length === 0 && query && (
                   <div 
                       className="px-4 py-3 text-sm text-slate-400 cursor-pointer hover:bg-slate-800 flex items-center gap-3"
                       onClick={handleAskAi}
                   >
                       <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                           <i className="fa-solid fa-question"></i>
                       </div>
                       <span>Ask Elevate: <span className="text-white">"{query}"</span></span>
                   </div>
               )}

               {filteredCommands.map((cmd, idx) => (
                 <div
                   key={cmd.id}
                   className={`px-4 py-3 flex items-center gap-3 cursor-pointer text-sm transition-colors ${
                     idx === selectedIndex ? 'bg-primary/20 text-white' : 'text-slate-400 hover:bg-slate-800'
                   }`}
                   onClick={() => {
                       if (cmd.page) onNavigate(cmd.page);
                       onClose();
                   }}
                   onMouseEnter={() => setSelectedIndex(idx)}
                 >
                   <div className={`w-8 h-8 rounded flex items-center justify-center ${
                       idx === selectedIndex ? 'bg-primary text-white' : 'bg-slate-800 text-muted'
                   }`}>
                       <i className={`fa-solid ${cmd.icon}`}></i>
                   </div>
                   <span className="font-medium flex-1">{cmd.label}</span>
                   {idx === selectedIndex && <span className="text-xs opacity-50">Enter</span>}
                 </div>
               ))}
            </>
          )}
        </div>
        
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            <div className="flex gap-2">
                <span><i className="fa-solid fa-arrow-up"></i> <i className="fa-solid fa-arrow-down"></i> Navigate</span>
                <span><i className="fa-solid fa-turn-down ml-1"></i> Select</span>
            </div>
            <span>Elevate OS v1.0</span>
        </div>
      </div>
    </div>
  );
};