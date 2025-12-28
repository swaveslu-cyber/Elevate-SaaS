import React, { useState } from 'react';
import { generateStoryboard, generateSocialImage } from '../services/geminiService';
import { StoryboardSequence, StoryFrame } from '../types';

export const TheStoryboard: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('Instagram Story');
  const [vibe, setVibe] = useState('Cinematic & Moody');
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [sequence, setSequence] = useState<StoryboardSequence | null>(null);
  const [renderingFrame, setRenderingFrame] = useState<number | null>(null);

  const handleArchitect = async () => {
      if (!topic) return;
      setIsArchitecting(true);
      setSequence(null);
      
      const result = await generateStoryboard(topic, format, vibe);
      setSequence(result);
      setIsArchitecting(false);
  };

  const handleRenderFrame = async (frame: StoryFrame) => {
      setRenderingFrame(frame.frameNumber);
      
      const win = window as any;
      if (win.aistudio && !await win.aistudio.hasSelectedApiKey()) {
          await win.aistudio.openSelectKey();
      }

      // 9:16 for stories, 1:1 for carousels usually, simplify to 9:16 or 1:1 based on format
      const aspectRatio = format.includes('Story') || format.includes('TikTok') ? '9:16' : '1:1';
      
      const imageUrl = await generateSocialImage(frame.visualPrompt, { aspectRatio: aspectRatio, highQuality: false });
      
      if (sequence && imageUrl) {
          const updatedFrames = sequence.frames.map(f => 
              f.frameNumber === frame.frameNumber ? { ...f, generatedImageUrl: imageUrl } : f
          );
          setSequence({ ...sequence, frames: updatedFrames });
      }
      setRenderingFrame(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Config */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/10 to-orange-900/10 pointer-events-none"></div>
            
            <div className="flex-1 w-full space-y-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded bg-yellow-600 flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-film"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Storyboard</h2>
                        <p className="text-sm text-muted">Architect visual narratives frame-by-frame.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Topic / Story</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. 'Day in the life of a founder'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-yellow-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Format</label>
                        <select 
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-yellow-500 outline-none"
                        >
                            <option>Instagram Story</option>
                            <option>TikTok Slideshow</option>
                            <option>LinkedIn Carousel</option>
                            <option>YouTube Shorts</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Visual Vibe</label>
                        <input 
                            type="text" 
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            placeholder="e.g. 'Cyberpunk', 'Minimalist'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-yellow-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleArchitect}
                disabled={isArchitecting || !topic}
                className="w-full md:w-auto px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 relative z-10"
            >
                {isArchitecting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Generate Sequence'}
            </button>
       </div>

       {/* Sequence Viewer */}
       <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden flex flex-col relative">
            {!sequence ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-images text-6xl mb-4"></i>
                    <p>Ready to visualize your story.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 flex items-center">
                    <div className="flex gap-8 min-w-max mx-auto">
                        {sequence.frames.map((frame, idx) => (
                            <div key={idx} className="w-64 flex flex-col gap-4 group">
                                {/* Visual Frame */}
                                <div className={`relative aspect-[9/16] bg-slate-900 rounded-xl border-2 ${renderingFrame === frame.frameNumber ? 'border-yellow-500 animate-pulse' : 'border-slate-700'} overflow-hidden shadow-2xl flex items-center justify-center group-hover:border-yellow-500/50 transition-colors`}>
                                    {frame.generatedImageUrl ? (
                                        <>
                                            <img src={frame.generatedImageUrl} alt={`Frame ${frame.frameNumber}`} className="w-full h-full object-cover" />
                                            {/* Text Overlay Simulation */}
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <p className="text-white font-bold text-center drop-shadow-md text-lg bg-black/30 p-2 rounded backdrop-blur-sm">
                                                    {frame.overlayText}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 text-center">
                                            <p className="text-xs text-slate-500 mb-4">{frame.visualPrompt}</p>
                                            <button 
                                                onClick={() => handleRenderFrame(frame)}
                                                className="px-4 py-2 bg-slate-800 hover:bg-yellow-600 hover:text-white text-slate-300 rounded-full text-xs font-bold transition-all border border-slate-600"
                                            >
                                                {renderingFrame === frame.frameNumber ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Render Visual'}
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                                        Frame {frame.frameNumber}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                                        {frame.estimatedDuration}
                                    </div>
                                </div>

                                {/* Script Data */}
                                <div className="bg-surface p-4 rounded-xl border border-slate-700 space-y-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider block mb-1">Overlay</span>
                                        <p className="text-sm text-white font-medium leading-tight">"{frame.overlayText}"</p>
                                    </div>
                                    {frame.voiceover && (
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Voiceover</span>
                                            <p className="text-xs text-slate-400 italic">"{frame.voiceover}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};