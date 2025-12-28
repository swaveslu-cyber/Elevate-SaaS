import React, { useState } from 'react';
import { scanUGC, generateRightsRequest } from '../services/geminiService';
import { UGCItem } from '../types';

export const TheMosaic: React.FC = () => {
  const [hashtag, setHashtag] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [items, setItems] = useState<UGCItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<UGCItem | null>(null);
  const [requestDraft, setRequestDraft] = useState('');
  const [isGeneratingRequest, setIsGeneratingRequest] = useState(false);

  const handleScan = async () => {
      if (!hashtag) return;
      setIsScanning(true);
      setItems([]);
      setSelectedItem(null);
      const results = await scanUGC(hashtag);
      setItems(results);
      setIsScanning(false);
  };

  const handleSelect = async (item: UGCItem) => {
      setSelectedItem(item);
      setRequestDraft('');
      
      if (item.rightsStatus === 'New') {
          setIsGeneratingRequest(true);
          const draft = await generateRightsRequest(item);
          setRequestDraft(draft);
          setIsGeneratingRequest(false);
      }
  };

  const handleCopyRequest = () => {
      navigator.clipboard.writeText(requestDraft);
      if (selectedItem) {
          const updated = items.map(i => i.id === selectedItem.id ? { ...i, rightsStatus: 'Requested' as const } : i);
          setItems(updated);
          setSelectedItem({ ...selectedItem, rightsStatus: 'Requested' });
      }
  };

  const getPlatformIcon = (platform: string) => {
      if (platform === 'Instagram') return 'fa-brands fa-instagram text-pink-500';
      if (platform === 'TikTok') return 'fa-brands fa-tiktok text-white';
      return 'fa-brands fa-twitter text-blue-400';
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Scanner Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden items-end">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-pink-900/10 pointer-events-none"></div>
            
            <div className="relative z-10 flex-1 w-full space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <i className="fa-solid fa-shapes"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Mosaic</h2>
                        <p className="text-sm text-muted">UGC Curation & Rights Management</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">#</span>
                        <input 
                            type="text" 
                            value={hashtag}
                            onChange={(e) => setHashtag(e.target.value.replace('#',''))}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            placeholder="brandname (e.g. 'nike', 'apple')..."
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-8 pr-4 text-sm focus:border-indigo-500 outline-none shadow-inner"
                        />
                    </div>
                    <button 
                        onClick={handleScan}
                        disabled={isScanning || !hashtag}
                        className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50 min-w-[100px]"
                    >
                        {isScanning ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Scan Feed'}
                    </button>
                </div>
            </div>
       </div>

       {/* Gallery & Inspector */}
       <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto pr-2">
                {!items.length && !isScanning ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted opacity-40">
                        <i className="fa-solid fa-images text-6xl mb-4"></i>
                        <p>Enter a hashtag to discover user content.</p>
                    </div>
                ) : (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {items.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={`break-inside-avoid bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all border-2 group relative ${
                                    selectedItem?.id === item.id ? 'border-indigo-500 shadow-xl shadow-indigo-500/20' : 'border-transparent'
                                }`}
                            >
                                <img src={item.imageUrl} alt={item.caption} className="w-full h-auto object-cover" />
                                
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-bold flex items-center gap-1">
                                    <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                                    {item.brandFitScore}
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <i className={getPlatformIcon(item.platform)}></i>
                                        <span className="text-xs font-bold text-white">@{item.userHandle}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-300 line-clamp-2">{item.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inspector Panel */}
            {selectedItem && (
                <div className="w-80 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden animate-fade-in-right">
                    <div className="relative h-48 bg-black">
                        <img src={selectedItem.imageUrl} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="font-bold text-white text-lg">@{selectedItem.userHandle}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <i className={getPlatformIcon(selectedItem.platform)}></i>
                                        <span>{selectedItem.platform}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-white">{selectedItem.likes}</div>
                                    <div className="text-[10px] uppercase text-muted font-bold">Likes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Brand Fit Score */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase text-muted">Brand Fit</span>
                                <span className={`text-lg font-bold ${
                                    selectedItem.brandFitScore > 80 ? 'text-emerald-400' : 'text-amber-400'
                                }`}>{selectedItem.brandFitScore}/100</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-3">
                                <div className={`h-full rounded-full ${
                                    selectedItem.brandFitScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`} style={{width: `${selectedItem.brandFitScore}%`}}></div>
                            </div>
                            <p className="text-xs text-slate-400 italic">"{selectedItem.brandFitReason}"</p>
                        </div>

                        {/* Caption */}
                        <div>
                            <h4 className="text-xs font-bold uppercase text-muted mb-2">Original Caption</h4>
                            <p className="text-sm text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-slate-700/50">
                                {selectedItem.caption}
                            </p>
                        </div>

                        {/* Rights Management */}
                        <div>
                            <h4 className="text-xs font-bold uppercase text-muted mb-2 flex justify-between">
                                <span>Rights Status</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                    selectedItem.rightsStatus === 'Requested' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                                }`}>{selectedItem.rightsStatus}</span>
                            </h4>
                            
                            {isGeneratingRequest ? (
                                <div className="text-center py-4 text-indigo-400 text-xs">
                                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Drafting request...
                                </div>
                            ) : (
                                <div className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-xl">
                                    <p className="text-xs text-indigo-100 mb-3 whitespace-pre-wrap">{requestDraft}</p>
                                    <button 
                                        onClick={handleCopyRequest}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg"
                                    >
                                        Copy Request
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};