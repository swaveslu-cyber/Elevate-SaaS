import React, { useState } from 'react';
import { CalendarPost, GeneratorTone } from '../types';
import { generateCampaignSchedule } from '../services/geminiService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['9 AM', '12 PM', '3 PM', '6 PM'];

const INITIAL_POSTS: CalendarPost[] = [
    { id: '1', day: 'Mon', time: '9 AM', platform: 'twitter', postType: 'Tweet', content: 'Product launch thread...' },
    { id: '2', day: 'Wed', time: '3 PM', platform: 'instagram', postType: 'Reel', content: 'Behind the scenes...' },
];

export const Scheduler: React.FC = () => {
  const [posts, setPosts] = useState<CalendarPost[]>(INITIAL_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState<GeneratorTone>(GeneratorTone.PROFESSIONAL);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCampaign = async () => {
    if (!goal) return;
    setIsGenerating(true);
    
    const newPosts = await generateCampaignSchedule(goal, tone);
    if (newPosts.length > 0) {
        setPosts([...posts, ...newPosts]);
        setIsModalOpen(false);
        setGoal('');
    }
    setIsGenerating(false);
  };

  const getPostsForSlot = (day: string, time: string) => {
    return posts.filter(p => p.day === day && p.time === time);
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('twitter') || p.includes('x')) return 'fa-brands fa-twitter text-blue-400';
    if (p.includes('instagram')) return 'fa-brands fa-instagram text-pink-400';
    if (p.includes('linkedin')) return 'fa-brands fa-linkedin text-blue-600';
    if (p.includes('facebook')) return 'fa-brands fa-facebook text-blue-500';
    return 'fa-solid fa-share-nodes text-slate-400';
  };

  const getPlatformColor = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('twitter')) return 'bg-blue-500/10 border-blue-500/30';
    if (p.includes('instagram')) return 'bg-pink-500/10 border-pink-500/30';
    if (p.includes('linkedin')) return 'bg-blue-600/10 border-blue-600/30';
    return 'bg-slate-700/30 border-slate-600/30';
  };

  return (
    <div className="h-full flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Content Calendar</h2>
        <div className="flex gap-3">
             <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
             >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                AI Architect
             </button>
            <div className="flex bg-surface border border-slate-700 rounded-lg p-0.5">
                <button className="px-3 py-1.5 bg-slate-700 text-white rounded text-xs font-medium">Week</button>
                <button className="px-3 py-1.5 text-muted hover:text-white rounded text-xs font-medium">Month</button>
            </div>
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-xl">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-slate-700 bg-slate-800/80">
            <div className="p-4 border-r border-slate-700 text-center text-sm font-medium text-muted">Time</div>
            {DAYS.map(day => (
                <div key={day} className="p-4 text-center text-sm font-bold border-r border-slate-700 last:border-r-0 text-indigo-100">
                    {day}
                </div>
            ))}
        </div>
        
        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto">
            {TIMES.map(time => (
                <div key={time} className="grid grid-cols-8 min-h-[140px] border-b border-slate-700 last:border-b-0">
                    {/* Time Column */}
                    <div className="p-4 border-r border-slate-700 text-xs text-muted font-medium flex items-start justify-center pt-4 bg-slate-800/30">
                        {time}
                    </div>
                    {/* Day Columns */}
                    {DAYS.map((day) => (
                        <div key={`${day}-${time}`} className="border-r border-slate-700 last:border-r-0 p-2 relative group hover:bg-slate-800/20 transition-colors">
                            <div className="space-y-2">
                                {getPostsForSlot(day, time).map(post => (
                                    <div key={post.id} className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity ${getPlatformColor(post.platform)}`}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <i className={getPlatformIcon(post.platform)}></i>
                                                <span className="font-bold capitalize text-slate-200">{post.postType}</span>
                                            </div>
                                            <i className="fa-solid fa-ellipsis-vertical text-slate-500"></i>
                                        </div>
                                        <p className="line-clamp-2 text-slate-300 leading-snug">{post.content}</p>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Add Button on Hover */}
                            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fa-solid fa-plus-circle text-slate-400 hover:text-primary text-xl"></i>
                            </button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
      </div>

      {/* AI Campaign Wizard Modal */}
      {isModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-surface border border-slate-600 rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-muted hover:text-white"
                  >
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <i className="fa-solid fa-wand-magic-sparkles text-white"></i>
                      </div>
                      <h3 className="text-2xl font-bold">Campaign Architect</h3>
                  </div>

                  <div className="space-y-5">
                      <div>
                          <label className="block text-sm font-medium text-muted mb-2">Campaign Goal</label>
                          <input 
                              type="text" 
                              value={goal}
                              onChange={(e) => setGoal(e.target.value)}
                              placeholder="e.g. Drive registrations for our new webinar on Friday..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-muted mb-2">Content Tone</label>
                          <select 
                            value={tone} 
                            onChange={(e) => setTone(e.target.value as GeneratorTone)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none"
                          >
                            {Object.values(GeneratorTone).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-xs text-blue-200">
                          <i className="fa-solid fa-circle-info mr-2"></i>
                          The AI will generate 5-7 optimized posts spread across the week for various platforms.
                      </div>

                      <button 
                          onClick={handleGenerateCampaign}
                          disabled={isGenerating || !goal}
                          className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                          {isGenerating ? (
                              <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                Architecting Campaign...
                              </>
                          ) : (
                              'Generate Schedule'
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};