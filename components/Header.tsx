import React, { useState } from 'react';
import { SystemNotification } from '../types';

interface HeaderProps {
  title: string;
  onOpenPalette?: () => void;
  onToggleCortex?: () => void;
}

const MOCK_NOTIFICATIONS: SystemNotification[] = [
    { id: '1', title: 'Director AI', message: 'Video render complete for "Project Alpha".', type: 'success', timestamp: 'Just now', read: false },
    { id: '2', title: 'Trend Alert', message: 'Spike in topic "Generative UI" detected.', type: 'info', timestamp: '5m ago', read: false },
    { id: '3', title: 'Syndicate', message: 'Scribe AI completed the blog draft.', type: 'success', timestamp: '1h ago', read: true },
    { id: '4', title: 'System', message: 'API Usage warning: 85% of quota.', type: 'warning', timestamp: '2h ago', read: true },
];

export const Header: React.FC<HeaderProps> = ({ title, onOpenPalette, onToggleCortex }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'success': return 'fa-circle-check text-emerald-400';
          case 'warning': return 'fa-triangle-exclamation text-amber-400';
          case 'error': return 'fa-circle-xmark text-red-400';
          default: return 'fa-circle-info text-blue-400';
      }
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-xl font-semibold text-text flex items-center gap-3">
          {title}
          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-muted uppercase tracking-wider font-bold">
              v2.0 Beta
          </span>
      </h1>
      
      <div className="flex items-center gap-4">
        {/* Omni-Bar Trigger */}
        <button 
            onClick={onOpenPalette}
            className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-muted transition-colors mr-2 group"
        >
            <i className="fa-solid fa-magnifying-glass group-hover:text-white"></i>
            <span>Search or type a command...</span>
            <span className="ml-4 bg-slate-700 px-1.5 rounded text-[10px] border border-slate-600">⌘K</span>
        </button>

        <button 
            onClick={onToggleCortex}
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-indigo-500/20 text-indigo-300 hover:text-white transition-colors border border-transparent hover:border-indigo-500/50 group"
            title="Open Omni-Cortex"
        >
            <i className="fa-solid fa-brain text-lg group-hover:animate-pulse"></i>
        </button>

        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-colors ${showNotifications ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-muted hover:text-text'}`}
            >
                <i className="fa-regular fa-bell text-lg"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in origin-top-right">
                    <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Alerts</h3>
                        <button onClick={markAllRead} className="text-[10px] text-indigo-400 hover:text-indigo-300">Mark all read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors flex gap-3 ${notif.read ? 'opacity-60' : 'opacity-100'}`}>
                                <div className="mt-1">
                                    <i className={`fa-solid ${getIcon(notif.type)}`}></i>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white mb-0.5">{notif.title}</h4>
                                    <p className="text-xs text-slate-400 leading-tight mb-1">{notif.message}</p>
                                    <span className="text-[10px] text-slate-600">{notif.timestamp}</span>
                                </div>
                                {!notif.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>}
                            </div>
                        ))}
                    </div>
                    <div className="p-2 bg-slate-950 text-center border-t border-slate-800">
                        <button className="text-xs text-muted hover:text-white">View All Activity</button>
                    </div>
                </div>
            )}
        </div>
        
        <button className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/25">
          <i className="fa-solid fa-plus mr-2"></i>
          New Post
        </button>
      </div>
    </header>
  );
};