import React, { useState, useEffect } from 'react';
import { analyzeVideoTimeline, parseScriptToTimeline, generateSocialImage, generateSocialVideo, generateDirectorShotPrompt } from '../services/geminiService';
import { DirectorTimeline, VideoClip, Asset } from '../types';

const INITIAL_TIMELINE: DirectorTimeline = {
    duration: 120,
    clips: [
        { id: 'c1', name: 'Intro_Shot_01.mp4', startTime: 0, endTime: 10, type: 'video', track: 1, color: 'bg-blue-600' },
        { id: 'c2', name: 'Interview_Main.mp4', startTime: 10, endTime: 45, type: 'video', track: 1, color: 'bg-emerald-600' },
        { id: 'c3', name: 'B-Roll_Office.mp4', startTime: 15, endTime: 25, type: 'video', track: 2, color: 'bg-purple-600' },
        { id: 'a1', name: 'Background_Music.mp3', startTime: 0, endTime: 120, type: 'audio', track: 3, color: 'bg-amber-600' },
    ]
};

export const TheDirector: React.FC = () => {
  const [timeline, setTimeline] = useState<DirectorTimeline>(INITIAL_TIMELINE);
  const [command, setCommand] = useState('');
  const [script, setScript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'script'>('timeline');
  const [panelTab, setPanelTab] = useState<'ai' | 'media'>('ai');
  
  // Asset Vault State
  const [vaultAssets, setVaultAssets] = useState<Asset[]>([]);

  // Selection & Generation State
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<Record<string, string>>({}); // clipId -> assetUrl
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);

  // Load Assets
  useEffect(() => {
      const stored = localStorage.getItem('elevate_assets');
      if (stored) {
          setVaultAssets(JSON.parse(stored));
      }
  }, []);

  const handleCommand = async () => {
      if (!command) return;
      setIsProcessing(true);
      setLastAction(null);
      
      const result = await analyzeVideoTimeline(timeline, command);
      if (result) {
          setTimeline(result.newTimeline);
          setLastAction(result.action.description);
          setCommand('');
      }
      setIsProcessing(false);
  };

  const handleScriptParse = async () => {
      if (!script) return;
      setIsProcessing(true);
      const newTimeline = await parseScriptToTimeline(script);
      if (newTimeline) {
          setTimeline(newTimeline);
          setViewMode('timeline');
          setLastAction("Generated timeline from script");
      }
      setIsProcessing(false);
  };

  const handleGenerateAsset = async (type: 'image' | 'video') => {
      if (!selectedClip) return;
      
      setIsGeneratingAsset(true);
      const win = window as any;
      if (win.aistudio && !await win.aistudio.hasSelectedApiKey()) {
          await win.aistudio.openSelectKey();
      }

      const prompt = await generateDirectorShotPrompt(selectedClip.name, "Professional Video Production");
      let assetUrl: string | null = null;

      if (type === 'image') {
          assetUrl = await generateSocialImage(prompt, { aspectRatio: '16:9', highQuality: false });
      } else {
          assetUrl = await generateSocialVideo(prompt, { aspectRatio: '16:9' });
      }

      if (assetUrl) {
          setGeneratedAssets(prev => ({ ...prev, [selectedClip.id]: assetUrl }));
      }
      setIsGeneratingAsset(false);
  };

  const handleAddAssetToTimeline = (asset: Asset) => {
      // Find end of timeline to append
      const endTimes = timeline.clips.map(c => c.endTime);
      const maxTime = Math.max(0, ...endTimes);
      const duration = 5; // Default 5s duration for static images

      const newClip: VideoClip = {
          id: `vault-${Date.now()}`,
          name: asset.name,
          startTime: maxTime,
          endTime: maxTime + duration,
          type: asset.mimeType.startsWith('video') ? 'video' : 'video', // Treat images as video track clips
          track: 1,
          color: 'bg-cyan-600' // Distinct color for vault assets
      };

      setTimeline(prev => ({
          ...prev,
          duration: Math.max(prev.duration, newClip.endTime),
          clips: [...prev.clips, newClip]
      }));

      // Cache the asset data so it displays immediately
      setGeneratedAssets(prev => ({ ...prev, [newClip.id]: asset.data }));
      setSelectedClip(newClip);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Mode Switcher */}
       <div className="flex justify-center bg-surface border border-slate-700 p-1 rounded-lg w-fit mx-auto shadow-lg">
           <button 
                onClick={() => setViewMode('timeline')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'timeline' ? 'bg-red-600 text-white shadow' : 'text-muted hover:text-white'}`}
           >
               <i className="fa-solid fa-timeline mr-2"></i> Timeline View
           </button>
           <button 
                onClick={() => setViewMode('script')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'script' ? 'bg-red-600 text-white shadow' : 'text-muted hover:text-white'}`}
           >
               <i className="fa-solid fa-file-lines mr-2"></i> Script Mode
           </button>
       </div>

       {viewMode === 'script' ? (
           <div className="flex-1 bg-surface border border-slate-700 rounded-xl p-8 flex flex-col">
               <div className="mb-6 text-center">
                   <h2 className="text-2xl font-bold text-white mb-2">Script-to-Edit</h2>
                   <p className="text-muted text-sm">Paste your video script below. Gemini will break it down into shots, B-roll, and audio tracks.</p>
               </div>
               <textarea 
                   value={script}
                   onChange={(e) => setScript(e.target.value)}
                   placeholder="[SCENE START]&#10;INT. OFFICE - DAY&#10;Host: Welcome back to the channel. Today we're talking about AI.&#10;[B-ROLL: Computer screen showing code]&#10;..."
                   className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-xl p-6 text-base font-mono text-slate-300 focus:border-red-500 outline-none resize-none leading-relaxed"
               />
               <div className="mt-6 flex justify-end">
                   <button 
                       onClick={handleScriptParse}
                       disabled={isProcessing || !script}
                       className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                   >
                       {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                       Generate Timeline
                   </button>
               </div>
           </div>
       ) : (
           <>
                {/* Preview Monitor & Panels */}
                <div className="flex-1 flex gap-6 overflow-hidden">
                        {/* Monitor */}
                        <div className="flex-1 bg-black rounded-xl border border-slate-800 relative flex items-center justify-center group overflow-hidden shadow-2xl">
                            {selectedClip && generatedAssets[selectedClip.id] ? (
                                selectedClip.type === 'video' ? (
                                    generatedAssets[selectedClip.id].startsWith('data:image') ? (
                                        <img src={generatedAssets[selectedClip.id]} className="w-full h-full object-contain" alt="Generated Asset" />
                                    ) : (
                                        <video src={generatedAssets[selectedClip.id]} controls autoPlay loop className="w-full h-full object-contain" />
                                    )
                                ) : (
                                    <div className="text-center">
                                        <i className="fa-solid fa-music text-6xl text-white mb-4"></i>
                                        <p className="text-white">Audio Asset Generated</p>
                                    </div>
                                )
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-[url('https://picsum.photos/1280/720')] bg-cover bg-center opacity-30"></div>
                                    <div className="relative z-10 text-center">
                                        <i className="fa-solid fa-clapperboard text-6xl text-white opacity-50 mb-4"></i>
                                        <p className="text-slate-400 text-sm font-mono">
                                            {selectedClip ? `Selected: ${selectedClip.name}` : "Select a clip to visualize"}
                                        </p>
                                    </div>
                                </>
                            )}
                            
                            {/* Overlay UI */}
                            <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white font-mono">REC ●</div>
                            <div className="absolute bottom-8 w-full px-8">
                                <div className="flex justify-between text-xs text-white font-mono mb-2">
                                    <span>{selectedClip ? formatTime(selectedClip.startTime) : '00:00:00'}</span>
                                    <span>1080p 60fps</span>
                                </div>
                                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-1/4"></div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel (AI / Media) */}
                        <div className="w-80 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex gap-1">
                                <button 
                                    onClick={() => setPanelTab('ai')}
                                    className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${panelTab === 'ai' ? 'bg-slate-700 text-white' : 'text-muted hover:text-white'}`}
                                >
                                    AI Copilot
                                </button>
                                <button 
                                    onClick={() => setPanelTab('media')}
                                    className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${panelTab === 'media' ? 'bg-slate-700 text-white' : 'text-muted hover:text-white'}`}
                                >
                                    Media Pool
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {panelTab === 'ai' ? (
                                    <>
                                        {selectedClip ? (
                                            <div className="animate-fade-in space-y-4">
                                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Selected Shot</span>
                                                    <h3 className="text-white font-bold text-sm leading-tight mb-2">{selectedClip.name}</h3>
                                                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                                                        <span>In: {formatTime(selectedClip.startTime)}</span>
                                                        <span>Dur: {selectedClip.endTime - selectedClip.startTime}s</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Generative Actions</h4>
                                                    
                                                    {selectedClip.type === 'video' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleGenerateAsset('image')}
                                                                disabled={isGeneratingAsset}
                                                                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-600"
                                                            >
                                                                {isGeneratingAsset ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-regular fa-image"></i>}
                                                                Generate Storyboard Frame
                                                            </button>
                                                            
                                                            <button 
                                                                onClick={() => handleGenerateAsset('video')}
                                                                disabled={isGeneratingAsset}
                                                                className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                                                            >
                                                                {isGeneratingAsset ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-video"></i>}
                                                                Generate Clip (Veo)
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted opacity-60 py-10">
                                                <i className="fa-solid fa-arrow-pointer text-4xl mb-4"></i>
                                                <p className="text-sm">Select a timeline clip to edit.</p>
                                            </div>
                                        )}

                                        <div className="border-t border-slate-700 pt-4 mt-auto">
                                            <label className="text-xs font-bold text-muted uppercase mb-2 block">Natural Language Edit</label>
                                            <div className="relative">
                                                <textarea 
                                                    value={command}
                                                    onChange={(e) => setCommand(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleCommand())}
                                                    placeholder="e.g. 'Remove all silence'..."
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pr-10 text-xs focus:border-red-500 outline-none resize-none h-20 shadow-inner"
                                                />
                                                <button 
                                                    onClick={handleCommand}
                                                    disabled={isProcessing || !command}
                                                    className="absolute bottom-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                                >
                                                    <i className="fa-solid fa-arrow-up text-[10px]"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // MEDIA POOL TAB
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                                <i className="fa-solid fa-layer-group text-cyan-400"></i>
                                                Connected to Neural Vault
                                            </div>
                                        </div>
                                        
                                        {vaultAssets.length === 0 ? (
                                            <div className="text-center text-muted py-8">
                                                <i className="fa-solid fa-box-open text-3xl mb-2"></i>
                                                <p className="text-xs">No assets in Vault.</p>
                                                <p className="text-[10px]">Upload content in the Asset Vault.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {vaultAssets.map(asset => (
                                                    <div 
                                                        key={asset.id} 
                                                        onClick={() => handleAddAssetToTimeline(asset)}
                                                        className="aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 cursor-pointer hover:border-cyan-500 transition-all relative group"
                                                    >
                                                        <img src={asset.data} className="w-full h-full object-cover" alt={asset.name} />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <i className="fa-solid fa-plus text-white font-bold"></i>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                </div>

                {/* Timeline */}
                <div className="h-1/3 bg-slate-900 border-t border-slate-800 p-4 overflow-x-auto relative shadow-inner">
                        <div className="min-w-[1000px] h-full relative">
                            {/* Time Ruler */}
                            <div className="h-6 border-b border-slate-700 mb-2 flex text-[10px] text-slate-500 font-mono select-none">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div key={i} className="flex-1 border-l border-slate-800 pl-1">{formatTime(i * 10)}</div>
                                ))}
                            </div>

                            {/* Tracks */}
                            <div className="space-y-2 relative">
                                {/* Playhead */}
                                <div className="absolute top-0 bottom-0 left-[15%] w-0.5 bg-red-500 z-50 pointer-events-none">
                                    <div className="w-3 h-3 -ml-1.5 -mt-1.5 bg-red-500 transform rotate-45"></div>
                                </div>

                                {[1, 2, 3].map(trackId => (
                                    <div key={trackId} className="h-12 bg-slate-950/50 rounded border border-slate-800 relative group hover:bg-slate-900/80 transition-colors">
                                        <div className="absolute left-0 top-0 bottom-0 w-6 bg-slate-800/50 border-r border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold">T{trackId}</div>
                                        {timeline.clips.filter(c => c.track === trackId).map(clip => (
                                            <div 
                                                key={clip.id}
                                                onClick={() => setSelectedClip(clip)}
                                                className={`absolute top-1 bottom-1 rounded px-2 flex items-center overflow-hidden text-[10px] font-bold text-white shadow-md cursor-pointer transition-all border ${
                                                    selectedClip?.id === clip.id 
                                                    ? 'border-white ring-2 ring-red-500 z-10' 
                                                    : 'border-white/10 hover:brightness-110'
                                                } ${clip.color}`}
                                                style={{
                                                    left: `${(clip.startTime / timeline.duration) * 100}%`,
                                                    width: `${((clip.endTime - clip.startTime) / timeline.duration) * 100}%`
                                                }}
                                                title={clip.name}
                                            >
                                                {generatedAssets[clip.id] && <i className="fa-solid fa-film mr-1 text-white/80"></i>}
                                                <span className="truncate">{clip.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                </div>
           </>
       )}
    </div>
  );
};