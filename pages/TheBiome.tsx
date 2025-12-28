import React, { useState, useEffect } from 'react';
import { analyzeEcosystem, compostContent } from '../services/geminiService';
import { BiomeState, BiomePlant } from '../types';

export const TheBiome: React.FC = () => {
  const [biomeState, setBiomeState] = useState<BiomeState | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<BiomePlant | null>(null);
  const [compostResult, setCompostResult] = useState('');
  const [isComposting, setIsComposting] = useState(false);

  // Mock content history for demo
  const mockContentHistory = [
      { id: '1', title: 'Ultimate Guide to SEO', type: 'tree', metrics: '45k Views' },
      { id: '2', title: 'Funny Office Prank', type: 'flower', metrics: '12k Likes' },
      { id: '3', title: 'Monday Motivation', type: 'shrub', metrics: '800 Views' },
      { id: '4', title: 'Q3 Report Analysis', type: 'wilted', metrics: 'Low Engagement' },
      { id: '5', title: 'New Product Teaser', type: 'sprout', metrics: 'Just Posted' },
  ];

  const handleAnalyze = async () => {
      setIsAnalyzing(true);
      setBiomeState(null);
      // Simulate API call with mock history
      const result = await analyzeEcosystem(mockContentHistory);
      setBiomeState(result);
      setIsAnalyzing(false);
  };

  const handleCompost = async () => {
      if (!selectedPlant) return;
      setIsComposting(true);
      setCompostResult('');
      const ideas = await compostContent(selectedPlant.title);
      setCompostResult(ideas);
      setIsComposting(false);
  };

  const getPlantEmoji = (type: string) => {
      switch(type) {
          case 'tree': return '🌳';
          case 'flower': return '🌻';
          case 'shrub': return '🌿';
          case 'wilted': return '🥀';
          case 'sprout': return '🌱';
          default: return '❓';
      }
  };

  const getWeatherIcon = (weather: string) => {
      if (weather.includes('Sunny')) return 'fa-sun text-yellow-400';
      if (weather.includes('Stormy')) return 'fa-bolt text-slate-400';
      return 'fa-cloud text-blue-300';
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-lime-900/20 pointer-events-none"></div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-seedling text-emerald-500"></i> The Biome
                </h2>
                <p className="text-sm text-muted">Ecosystem Health Visualizer</p>
            </div>

            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="relative z-10 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2"
            >
                {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
                Analyze Ecosystem
            </button>
       </div>

       {/* Main View */}
       <div className="flex-1 flex gap-6 overflow-hidden">
            {/* The Garden */}
            <div className="flex-1 bg-gradient-to-b from-sky-900/30 to-emerald-900/30 border border-slate-700 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-8">
                {!biomeState ? (
                    <div className="text-center text-muted opacity-50">
                        <i className="fa-solid fa-tree text-6xl mb-4"></i>
                        <p>Run analysis to visualize your content garden.</p>
                    </div>
                ) : (
                    <>
                        {/* Weather Overlay */}
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-3">
                            <i className={`fa-solid ${getWeatherIcon(biomeState.weather)} text-2xl`}></i>
                            <div>
                                <span className="block text-xs font-bold text-white uppercase">{biomeState.weather}</span>
                                <span className="text-[10px] text-slate-300">{biomeState.weatherDescription}</span>
                            </div>
                        </div>

                        {/* Health Score */}
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Health Score</span>
                            <div className="text-3xl font-black text-white">{biomeState.healthScore}%</div>
                        </div>

                        {/* Garden Grid */}
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-8 animate-fade-in-up">
                            {biomeState.plants.map((plant) => (
                                <button 
                                    key={plant.id}
                                    onClick={() => setSelectedPlant(plant)}
                                    className={`flex flex-col items-center gap-2 group transition-all transform hover:scale-110 ${selectedPlant?.id === plant.id ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}
                                >
                                    <span className="text-6xl filter drop-shadow-lg">{getPlantEmoji(plant.type)}</span>
                                    <span className={`text-[10px] bg-black/50 px-2 py-1 rounded text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity ${selectedPlant?.id === plant.id ? 'opacity-100' : ''}`}>
                                        {plant.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Inspector Panel */}
            {biomeState && (
                <div className="w-80 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden animate-fade-in-right">
                    {selectedPlant ? (
                        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-2">{getPlantEmoji(selectedPlant.type)}</div>
                                <h3 className="font-bold text-white text-sm">{selectedPlant.title}</h3>
                                <span className="text-xs text-emerald-400 font-mono">{selectedPlant.metrics}</span>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <h4 className="text-[10px] font-bold text-muted uppercase mb-1">AI Diagnosis</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed">"{selectedPlant.analysis}"</p>
                                </div>
                            </div>

                            <div className="mt-auto space-y-2">
                                {selectedPlant.type === 'wilted' && (
                                    <button 
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fa-solid fa-droplet"></i> Water (Boost)
                                    </button>
                                )}
                                
                                <button 
                                    onClick={handleCompost}
                                    className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-recycle"></i> Compost (Recycle)
                                </button>

                                {compostResult && (
                                    <div className="mt-4 bg-amber-900/20 border border-amber-600/30 p-3 rounded-lg animate-fade-in">
                                        <h4 className="text-[10px] font-bold text-amber-500 uppercase mb-2">Nutrient Extraction</h4>
                                        <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {isComposting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : compostResult}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 p-6">
                            <h3 className="font-bold text-white mb-4">Recommendations</h3>
                            <ul className="space-y-3">
                                {biomeState.recommendations.map((rec, i) => (
                                    <li key={i} className="text-xs text-slate-300 flex gap-2">
                                        <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 text-center text-muted text-xs">
                                Click a plant to inspect.
                            </div>
                        </div>
                    )}
                </div>
            )}
       </div>
    </div>
  );
};