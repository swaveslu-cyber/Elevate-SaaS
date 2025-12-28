import React, { useState, useEffect, useRef } from 'react';
import { autoTagAsset, semanticSearchAssets } from '../services/geminiService';
import { Asset } from '../types';

interface AssetVaultProps {
    onNavigate?: (page: string) => void;
}

export const AssetVault: React.FC<AssetVaultProps> = ({ onNavigate }) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [query, setQuery] = useState('');
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load assets from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('elevate_assets');
        if (stored) {
            const parsed = JSON.parse(stored);
            setAssets(parsed);
            setFilteredAssets(parsed);
        }
    }, []);

    // Filter logic
    useEffect(() => {
        if (!query) {
            setFilteredAssets(assets);
            return;
        }
    }, [query, assets]);

    const handleSearch = async () => {
        if (!query) {
            setFilteredAssets(assets);
            return;
        }
        setIsSearching(true);
        
        // Use AI Semantic Search
        const matchingIds = await semanticSearchAssets(query, assets);
        
        if (matchingIds.length > 0) {
            const results = assets.filter(a => matchingIds.includes(a.id));
            setFilteredAssets(results);
        } else {
            setFilteredAssets([]);
        }
        setIsSearching(false);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Url = reader.result as string;
                const base64Data = base64Url.split(',')[1];
                setIsUploading(true);

                // Auto-Tag with Gemini
                const metadata = await autoTagAsset(base64Data, file.type);
                
                const newAsset: Asset = {
                    id: Math.random().toString(36).substr(2, 9),
                    data: base64Url,
                    mimeType: file.type,
                    name: file.name,
                    tags: metadata?.tags || ['untagged'],
                    aiDescription: metadata?.description || 'No description available',
                    dateAdded: Date.now()
                };

                const updatedAssets = [newAsset, ...assets];
                setAssets(updatedAssets);
                setFilteredAssets(updatedAssets);
                localStorage.setItem('elevate_assets', JSON.stringify(updatedAssets));
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = (id: string) => {
        const updated = assets.filter(a => a.id !== id);
        setAssets(updated);
        setFilteredAssets(updated); // Reset filter to avoid confusion or re-filter
        localStorage.setItem('elevate_assets', JSON.stringify(updated));
        setSelectedAsset(null);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header / Search */}
            <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <i className="fa-solid fa-layer-group text-primary"></i> Neural Vault
                    </h2>
                    <p className="text-sm text-muted">AI-Indexed Asset Library</p>
                </div>

                <div className="flex-1 w-full md:max-w-xl flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder='Search by vibe (e.g., "futuristic neon city", "calm morning")...'
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 pl-10 text-sm focus:border-primary outline-none"
                        />
                        <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs"></i>
                    </div>
                    <button 
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-colors"
                    >
                        {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Search'}
                    </button>
                </div>

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 bg-primary hover:bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2"
                >
                    {isUploading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up"></i>}
                    Upload
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto">
                {assets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                        <i className="fa-solid fa-images text-6xl mb-4"></i>
                        <p>Your vault is empty. Upload images to begin.</p>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted">
                        <p>No assets match your query.</p>
                        <button onClick={() => { setQuery(''); setFilteredAssets(assets); }} className="text-primary mt-2 underline">Clear Search</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredAssets.map(asset => (
                            <div 
                                key={asset.id} 
                                onClick={() => setSelectedAsset(asset)}
                                className="group relative aspect-square bg-slate-800 rounded-xl overflow-hidden border border-slate-700 cursor-pointer hover:border-primary transition-all"
                            >
                                <img src={asset.data} alt={asset.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                    <p className="text-xs text-white font-bold line-clamp-1">{asset.name}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {asset.tags.slice(0, 2).map(t => (
                                            <span key={t} className="text-[10px] bg-white/20 px-1.5 rounded text-white">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedAsset(null)}>
                    <div className="bg-surface border border-slate-600 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row gap-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        
                        <div className="flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
                            <img src={selectedAsset.data} alt="Full view" className="max-w-full max-h-[60vh] object-contain" />
                        </div>

                        <div className="w-full md:w-80 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg line-clamp-1" title={selectedAsset.name}>{selectedAsset.name}</h3>
                                <button onClick={() => setSelectedAsset(null)} className="text-muted hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-muted uppercase mb-2">AI Context</h4>
                                    <p className="text-sm text-slate-300 italic bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        "{selectedAsset.aiDescription}"
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-muted uppercase mb-2">Smart Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAsset.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-muted uppercase mb-2">Metadata</h4>
                                    <div className="text-xs text-muted space-y-1">
                                        <p>Type: {selectedAsset.mimeType}</p>
                                        <p>Added: {new Date(selectedAsset.dateAdded).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <a 
                                    href={selectedAsset.data} 
                                    download={selectedAsset.name}
                                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-bold transition-colors text-center"
                                >
                                    Download
                                </a>
                                <button 
                                    onClick={() => handleDelete(selectedAsset.id)}
                                    className="w-full py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Delete Asset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};