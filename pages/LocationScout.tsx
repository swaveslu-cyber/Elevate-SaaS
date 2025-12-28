import React, { useState, useEffect } from 'react';
import { findPlaces } from '../services/geminiService';
import { ScoutResult } from '../types';

interface LocationScoutProps {
  onDraftPost: (topic: string) => void;
}

export const LocationScout: React.FC<LocationScoutProps> = ({ onDraftPost }) => {
  const [query, setQuery] = useState('');
  const [locationResult, setLocationResult] = useState<ScoutResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get User Location on Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location access denied or failed", error);
          setLocationError("Location access denied. Results may not be local.");
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    setLocationResult(null);

    const result = await findPlaces(query, userLocation);
    setLocationResult(result);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Search Bar / Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-8 relative overflow-hidden flex flex-col items-center">
            {/* Background Map Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center mix-blend-overlay"></div>
            
            <h2 className="text-3xl font-bold mb-2 relative z-10">Geo-Intelligence Scout</h2>
            <p className="text-muted mb-6 relative z-10 text-center max-w-lg">
                Find locations for your next shoot using Gemini's real-world grounding.
                <br />
                {userLocation ? (
                    <span className="text-emerald-400 text-xs flex items-center justify-center gap-1 mt-1">
                        <i className="fa-solid fa-location-crosshairs"></i> GPS Active
                    </span>
                ) : (
                    <span className="text-amber-400 text-xs flex items-center justify-center gap-1 mt-1">
                        <i className="fa-solid fa-location-slash"></i> Global Search Mode
                    </span>
                )}
            </p>

            <div className="relative w-full max-w-xl z-10">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. 'Aesthetic coffee shops in Paris', 'Industrial warehouses in Brooklyn'..."
                    className="w-full bg-slate-950/80 border border-slate-600 rounded-full py-4 px-6 pl-12 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-2xl transition-all"
                />
                <i className="fa-solid fa-map-location-dot absolute left-5 top-1/2 -translate-y-1/2 text-muted"></i>
                <button 
                    onClick={handleSearch}
                    disabled={isSearching || !query}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-6 py-2 text-xs font-bold transition-colors shadow-lg disabled:opacity-50"
                >
                    {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Scout'}
                </button>
            </div>
       </div>

       {/* Results Grid */}
       <div className="flex-1 overflow-y-auto">
            {isSearching ? (
                <div className="h-full flex flex-col items-center justify-center text-muted gap-4">
                    <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="animate-pulse">Triangulating aesthetic coordinates...</p>
                </div>
            ) : !locationResult ? (
                <div className="h-full flex flex-col items-center justify-center text-muted opacity-50">
                    <i className="fa-solid fa-globe text-6xl mb-4"></i>
                    <p>Enter a location query to begin scouting.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
                    {/* Analysis Column */}
                    <div className="lg:col-span-3 bg-surface border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-satellite-dish text-emerald-400"></i> AI Vibe Check
                        </h3>
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                             {/* Formatting the analysis text simply */}
                             <p className="leading-relaxed bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                                 {locationResult.analysis}
                             </p>
                        </div>
                    </div>

                    {/* Location Cards */}
                    {locationResult.locations.length > 0 ? (
                        locationResult.locations.map((loc, idx) => (
                            <div key={idx} className="bg-surface border border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors group flex flex-col">
                                <div className="h-32 bg-slate-800 relative overflow-hidden">
                                     {/* Placeholder map visual if no photo */}
                                     <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] opacity-10 bg-center bg-cover"></div>
                                     <div className="absolute inset-0 flex items-center justify-center">
                                         <i className="fa-solid fa-location-dot text-4xl text-emerald-500 drop-shadow-lg"></i>
                                     </div>
                                     <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                                         #{idx + 1}
                                     </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h4 className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{loc.name}</h4>
                                    <p className="text-xs text-muted mb-4 flex items-start gap-1">
                                        <i className="fa-solid fa-map-pin mt-0.5"></i>
                                        {loc.address || "Address available on map"}
                                    </p>
                                    
                                    <div className="mt-auto flex gap-2">
                                        <a 
                                            href={loc.googleMapsUri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <i className="fa-regular fa-map"></i> View Map
                                        </a>
                                        <button 
                                            onClick={() => onDraftPost(`Create a post about visiting ${loc.name}. Vibe: Aesthetic, Travel.`)}
                                            className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <i className="fa-solid fa-pen-nib"></i> Draft
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10 text-muted">
                            <i className="fa-solid fa-magnifying-glass-location text-4xl mb-2"></i>
                            <p>No specific map locations found in the grounding data.</p>
                        </div>
                    )}
                </div>
            )}
       </div>
    </div>
  );
};