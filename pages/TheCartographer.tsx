import React, { useState } from 'react';
import { generateCustomerJourney } from '../services/geminiService';
import { JourneyMap, JourneyStage } from '../types';

export const TheCartographer: React.FC = () => {
  const [product, setProduct] = useState('');
  const [persona, setPersona] = useState('');
  const [isMapping, setIsMapping] = useState(false);
  const [journey, setJourney] = useState<JourneyMap | null>(null);
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);

  const handleMap = async () => {
      if (!product || !persona) return;
      setIsMapping(true);
      setJourney(null);
      setSelectedStage(null);
      
      const result = await generateCustomerJourney(product, persona);
      setJourney(result);
      if (result && result.stages.length > 0) {
          setSelectedStage(result.stages[0]);
      }
      setIsMapping(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Config */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/20 to-cyan-950/20 pointer-events-none"></div>
            
            <div className="flex-1 space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-map-marked-alt"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Cartographer</h2>
                        <p className="text-sm text-muted">Customer Journey Mapping Engine</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="Product (e.g. 'SaaS CRM')"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                    />
                    <input 
                        type="text" 
                        value={persona}
                        onChange={(e) => setPersona(e.target.value)}
                        placeholder="Persona (e.g. 'Busy Startup Founder')"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-blue-500 outline-none"
                    />
                    <button 
                        onClick={handleMap}
                        disabled={isMapping || !product || !persona}
                        className="px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                    >
                        {isMapping ? <i className="fa-solid fa-compass fa-spin"></i> : 'Map Journey'}
                    </button>
                </div>
            </div>
       </div>

       {/* Map Visualization */}
       <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden flex flex-col relative">
            {!journey ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-route text-6xl mb-4"></i>
                    <p>Enter coordinates to chart the path.</p>
                </div>
            ) : (
                <div className="flex flex-col h-full animate-fade-in">
                    {/* Top: Timeline Selection */}
                    <div className="bg-slate-900 border-b border-slate-800 p-6 overflow-x-auto">
                        <div className="flex items-center justify-between min-w-[800px] relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -z-0"></div>
                            
                            {journey.stages.map((stage, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedStage(stage)}
                                    className={`relative z-10 cursor-pointer flex flex-col items-center gap-3 group transition-all ${
                                        selectedStage === stage ? 'scale-110' : 'hover:scale-105'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-xl transition-colors ${
                                        selectedStage === stage 
                                        ? 'bg-blue-600 border-blue-400 text-white' 
                                        : 'bg-slate-800 border-slate-600 text-slate-400 group-hover:border-blue-500'
                                    }`}>
                                        <span className="font-bold text-lg">{i + 1}</span>
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wider bg-slate-950 px-2 py-1 rounded ${
                                        selectedStage === stage ? 'text-blue-400' : 'text-slate-500'
                                    }`}>
                                        {stage.stageName}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: Detailed View */}
                    {selectedStage && (
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-900/50">
                            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Psychology Column */}
                                <div className="space-y-6">
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-brain"></i> User Mindset
                                        </h4>
                                        <p className="text-white text-lg leading-relaxed font-medium">"{selectedStage.userMindset}"</p>
                                    </div>

                                    <div className="bg-red-950/20 p-6 rounded-xl border border-red-500/20">
                                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-hand-paper"></i> Friction Points
                                        </h4>
                                        <p className="text-red-200/80 leading-relaxed">{selectedStage.frictionPoints}</p>
                                    </div>
                                </div>

                                {/* Tactics Column */}
                                <div className="space-y-6">
                                    <div className="bg-emerald-950/20 p-6 rounded-xl border border-emerald-500/20">
                                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-lightbulb"></i> Strategic Opportunity
                                        </h4>
                                        <p className="text-emerald-200/80 leading-relaxed">{selectedStage.opportunity}</p>
                                    </div>

                                    <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/30">
                                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-bullseye"></i> Key Touchpoints
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selectedStage.touchpoints.map((tp, i) => (
                                                <span key={i} className="px-3 py-1 bg-blue-900/30 border border-blue-500/20 rounded-full text-xs text-blue-200">
                                                    {tp}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mt-4">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Generated Concept</span>
                                            <p className="text-sm text-white mb-3">{selectedStage.contentIdea}</p>
                                            <button className="text-xs font-bold text-blue-400 hover:text-white transition-colors flex items-center gap-1">
                                                <i className="fa-solid fa-pen-nib"></i> Draft in Studio
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
       </div>
    </div>
  );
};