import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, toggleSidebar }) => {
  const navItems: { id: Page; label: string; icon: string; danger?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'signal', label: 'The Signal', icon: 'fa-tower-broadcast' },
    { id: 'syndicate', label: 'The Syndicate', icon: 'fa-users-viewfinder' },
    { id: 'terminal', label: 'The Terminal', icon: 'fa-terminal' },
    { id: 'quantum', label: 'Quantum Feed', icon: 'fa-atom' },
    { id: 'loom', label: 'The Loom', icon: 'fa-scroll' },
    { id: 'biome', label: 'The Biome', icon: 'fa-seedling' },
    { id: 'oracle', label: 'The Oracle', icon: 'fa-eye' },
    { id: 'construct', label: 'The Construct', icon: 'fa-code' },
    { id: 'hive', label: 'The Hive', icon: 'fa-users-gear' },
    { id: 'codex', label: 'The Codex', icon: 'fa-book-journal-whills' },
    { id: 'verdict', label: 'The Verdict', icon: 'fa-gavel' },
    { id: 'resonator', label: 'The Resonator', icon: 'fa-volume-high' },
    { id: 'frequency', label: 'The Frequency', icon: 'fa-wave-square' },
    { id: 'echo', label: 'The Echo', icon: 'fa-microphone-lines' },
    { id: 'kaleidoscope', label: 'The Kaleidoscope', icon: 'fa-fan' },
    { id: 'mosaic', label: 'The Mosaic', icon: 'fa-border-all' },
    { id: 'cartographer', label: 'The Cartographer', icon: 'fa-map-marked-alt' },
    { id: 'catalyst', label: 'The Catalyst', icon: 'fa-flask-vial' },
    { id: 'alchemist', label: 'The Alchemist', icon: 'fa-flask' },
    { id: 'negotiator', label: 'The Negotiator', icon: 'fa-handshake' },
    { id: 'stylist', label: 'The Stylist', icon: 'fa-palette' },
    { id: 'scribe', label: 'The Scribe', icon: 'fa-feather-pointed' },
    { id: 'curator', label: 'The Curator', icon: 'fa-newspaper' },
    { id: 'director', label: 'The Director', icon: 'fa-clapperboard' },
    { id: 'showrunner', label: 'The Showrunner', icon: 'fa-film' },
    { id: 'storyboard', label: 'The Storyboard', icon: 'fa-images' },
    { id: 'academy', label: 'The Academy', icon: 'fa-graduation-cap' },
    { id: 'horizon', label: 'The Horizon', icon: 'fa-mountain-sun' },
    { id: 'deep', label: 'The Deep', icon: 'fa-water' },
    { id: 'prism', label: 'The Prism', icon: 'fa-shapes' },
    { id: 'mirror', label: 'The Mirror', icon: 'fa-yin-yang' },
    { id: 'pitch', label: 'The Pitch', icon: 'fa-person-chalkboard' },
    { id: 'adrenaline', label: 'Adrenaline', icon: 'fa-bolt' },
    { id: 'blueprint', label: 'The Blueprint', icon: 'fa-compass-drafting' },
    { id: 'launchpad', label: 'The Launchpad', icon: 'fa-rocket' },
    { id: 'circle', label: 'Inner Circle', icon: 'fa-users-line' },
    { id: 'dojo', label: 'The Dojo', icon: 'fa-user-ninja' },
    { id: 'nexus', label: 'The Nexus', icon: 'fa-circle-nodes' },
    { id: 'fusion', label: 'Fusion Reactor', icon: 'fa-flask' },
    { id: 'dna', label: 'Viral DNA', icon: 'fa-dna' },
    { id: 'capsule', label: 'Time Capsule', icon: 'fa-clock-rotate-left' },
    { id: 'boardroom', label: 'The Boardroom', icon: 'fa-people-arrows' },
    { id: 'strategy', label: 'Live Strategy', icon: 'fa-headset' },
    { id: 'competitors', label: 'Watchtower', icon: 'fa-tower-observation' },
    { id: 'partners', label: 'Partner Network', icon: 'fa-handshake-simple' },
    { id: 'personas', label: 'Persona Lab', icon: 'fa-users-rays' },
    { id: 'multiplier', label: 'Multiplier', icon: 'fa-arrows-split-up-and-left' },
    { id: 'globalize', label: 'Globalize Studio', icon: 'fa-earth-asia' },
    { id: 'research', label: 'Research Lab', icon: 'fa-microscope' },
    { id: 'trends', label: 'Trend Discovery', icon: 'fa-globe' },
    { id: 'scout', label: 'Geo-Intelligence', icon: 'fa-map-location-dot' },
    { id: 'studio', label: 'Content Studio', icon: 'fa-pen-nib' },
    { id: 'vault', label: 'Neural Vault', icon: 'fa-layer-group' },
    { id: 'flows', label: 'Neural Flows', icon: 'fa-network-wired' },
    { id: 'scheduler', label: 'Scheduler', icon: 'fa-calendar-alt' },
    { id: 'inbox', label: 'Unified Inbox', icon: 'fa-inbox' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-pie' },
    { id: 'ops', label: 'Business Ops', icon: 'fa-briefcase' },
    { id: 'brand-guard', label: 'Brand Guard', icon: 'fa-shield-halved', danger: true },
  ];

  return (
    <aside 
      className={`
        bg-surface border-r border-slate-700 h-full flex flex-col transition-all duration-300
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        <div className={`flex items-center gap-2 overflow-hidden ${!isOpen && 'justify-center w-full'}`}>
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <i className="fa-solid fa-layer-group text-white text-sm"></i>
          </div>
          {isOpen && <span className="font-bold text-xl tracking-tight">Elevate</span>}
        </div>
        {isOpen && (
          <button onClick={toggleSidebar} className="text-muted hover:text-text">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
              ${currentPage === item.id 
                ? (item.danger ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary/20 text-primary border border-primary/30')
                : (item.danger ? 'text-red-400/70 hover:bg-red-900/10 hover:text-red-400' : 'text-muted hover:bg-slate-700 hover:text-text')
              }
              ${!isOpen && 'justify-center'}
            `}
            title={!isOpen ? item.label : undefined}
          >
            <i className={`fa-solid ${item.icon} text-lg w-6 text-center`}></i>
            {isOpen && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile Stub */}
      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-3 w-full hover:bg-slate-800 p-2 rounded-lg transition-colors group ${!isOpen && 'justify-center'}`}
          title="Open Settings"
        >
          <img 
            src="https://picsum.photos/40/40" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-primary transition-colors"
          />
          {isOpen && (
            <div className="text-left overflow-hidden">
              <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">Alex Creator</p>
              <p className="text-xs text-muted truncate">Neural Core Active</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
