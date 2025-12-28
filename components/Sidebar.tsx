
import React from 'react';
import { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
  danger?: boolean;
}

interface NavGroup {
  label: string;
  icon: string;
  color: string;
  items: NavItem[];
}

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, toggleSidebar }) => {
  const navGroups: NavGroup[] = [
    {
      label: 'COMMAND',
      icon: 'fa-house-laptop',
      color: 'text-blue-400',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
        { id: 'war-room', label: 'War Room', icon: 'fa-chess-king', danger: true },
        { id: 'sigma', label: 'Protocol Sigma', icon: 'fa-microchip-ai' },
        { id: 'alpha', label: 'Protocol Alpha', icon: 'fa-wand-sparkles' },
        { id: 'delta', label: 'Protocol Delta', icon: 'fa-check-double' },
        { id: 'sentinel', label: 'The Sentinel', icon: 'fa-crosshairs' },
      ],
    },
    {
      label: 'STUDIO',
      icon: 'fa-film',
      color: 'text-pink-400',
      items: [
        { id: 'studio', label: 'Content Studio', icon: 'fa-pen-nib' },
        { id: 'director', label: 'The Director', icon: 'fa-clapperboard' },
        { id: 'frequency', label: 'The Frequency', icon: 'fa-wave-square' },
        { id: 'scribe', label: 'The Scribe', icon: 'fa-feather-pointed' },
        { id: 'storyboard', label: 'The Storyboard', icon: 'fa-images' },
        { id: 'adrenaline', label: 'Adrenaline', icon: 'fa-bolt' },
        { id: 'gamma', label: 'Protocol Gamma', icon: 'fa-ear-listen' },
        { id: 'echo', label: 'The Echo', icon: 'fa-microphone-lines' },
      ],
    },
    {
      label: 'INTELLIGENCE',
      icon: 'fa-brain',
      color: 'text-emerald-400',
      items: [
        { id: 'trends', label: 'Trend Discovery', icon: 'fa-globe' },
        { id: 'scout', label: 'Geo-Scout', icon: 'fa-map-location-dot' },
        { id: 'resonator', label: 'The Resonator', icon: 'fa-volume-high' },
        { id: 'verdict', label: 'The Verdict', icon: 'fa-gavel' },
        { id: 'mosaic', label: 'The Mosaic', icon: 'fa-border-all' },
        { id: 'archive', label: 'The Archive', icon: 'fa-box-archive' },
        { id: 'nexus', label: 'The Nexus', icon: 'fa-circle-nodes' },
        { id: 'partners', label: 'Partner Network', icon: 'fa-handshake-simple' },
        { id: 'competitors', label: 'Watchtower', icon: 'fa-tower-observation' },
        { id: 'personas', label: 'Persona Lab', icon: 'fa-users-rays' },
        { id: 'research', label: 'Research Lab', icon: 'fa-microscope' },
      ],
    },
    {
      label: 'STRATEGY',
      icon: 'fa-chess',
      color: 'text-amber-400',
      items: [
        { id: 'boardroom', label: 'The Boardroom', icon: 'fa-people-arrows' },
        { id: 'horizon', label: 'The Horizon', icon: 'fa-mountain-sun' },
        { id: 'deep', label: 'The Deep', icon: 'fa-water' },
        { id: 'prism', label: 'The Prism', icon: 'fa-shapes' },
        { id: 'oracle', label: 'The Oracle', icon: 'fa-eye' },
        { id: 'catalyst', label: 'The Catalyst', icon: 'fa-flask-vial' },
        { id: 'negotiator', label: 'The Negotiator', icon: 'fa-handshake' },
        { id: 'cartographer', label: 'The Cartographer', icon: 'fa-map-marked-alt' },
        { id: 'blueprint', label: 'The Blueprint', icon: 'fa-compass-drafting' },
        { id: 'launchpad', label: 'The Launchpad', icon: 'fa-rocket' },
        { id: 'strategy', label: 'Live Strategy', icon: 'fa-headset' },
      ],
    },
    {
      label: 'SYSTEMS',
      icon: 'fa-server',
      color: 'text-slate-400',
      items: [
        { id: 'terminal', label: 'The Terminal', icon: 'fa-terminal' },
        { id: 'syndicate', label: 'The Syndicate', icon: 'fa-users-viewfinder' },
        { id: 'settings', label: 'Neural Core', icon: 'fa-microchip' },
        { id: 'academy', label: 'The Academy', icon: 'fa-graduation-cap' },
        { id: 'codex', label: 'The Codex', icon: 'fa-book-journal-whills' },
        { id: 'hive', label: 'The Hive', icon: 'fa-users-gear' },
        { id: 'ops', label: 'Business Ops', icon: 'fa-briefcase' },
        { id: 'brand-guard', label: 'Brand Guard', icon: 'fa-shield-halved', danger: true },
      ],
    }
  ];

  return (
    <aside 
      className={`
        bg-slate-950 border-r border-slate-800 h-full flex flex-col transition-all duration-300 z-30
        ${isOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'justify-center w-full'}`}>
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-layer-group text-white text-sm"></i>
          </div>
          {isOpen && (
            <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white leading-none">Elevate</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">OS v2.0</span>
            </div>
          )}
        </div>
        {isOpen && (
          <button onClick={toggleSidebar} className="text-slate-500 hover:text-white transition-colors">
            <i className="fa-solid fa-chevron-left text-xs"></i>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
            <div key={idx} className="px-3">
                {isOpen && (
                    <div className="flex items-center gap-2 px-3 mb-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <i className={`fa-solid ${group.icon} ${group.color}`}></i>
                        {group.label}
                    </div>
                )}
                <div className="space-y-1">
                    {group.items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                                ${currentPage === item.id 
                                    ? (item.danger ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-white border border-slate-700 shadow-md')
                                    : (item.danger ? 'text-red-400/60 hover:bg-red-950/20 hover:text-red-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200')
                                }
                                ${!isOpen && 'justify-center'}
                            `}
                            title={!isOpen ? item.label : undefined}
                        >
                            <div className={`relative ${!isOpen ? 'text-lg' : 'text-sm'}`}>
                                <i className={`fa-solid ${item.icon} ${
                                    currentPage === item.id ? (item.danger ? 'text-red-500' : 'text-indigo-400') : ''
                                }`}></i>
                                {currentPage === item.id && !isOpen && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
                                )}
                            </div>
                            
                            {isOpen && <span className="font-medium text-xs truncate">{item.label}</span>}
                            
                            {/* Hover Tooltip for Closed State */}
                            {!isOpen && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        ))}
      </nav>

      {/* User Profile Stub */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <button 
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-3 w-full hover:bg-slate-800/50 p-2 rounded-xl transition-colors group ${!isOpen && 'justify-center'}`}
          title="Open Settings"
        >
          <div className="relative">
              <img 
                src="https://ui-avatars.com/api/?name=Alex+Creator&background=6366f1&color=fff" 
                alt="User" 
                className="w-9 h-9 rounded-lg border border-slate-600 group-hover:border-indigo-500 transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
          </div>
          {isOpen && (
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">Alex Creator</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">NEURAL_LINK_ACTIVE</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
