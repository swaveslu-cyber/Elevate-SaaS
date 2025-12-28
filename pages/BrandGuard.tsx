import React, { useState } from 'react';
import { simulatePublicReaction, generateCrisisResponse } from '../services/geminiService';
import { SimulationResult, CrisisResponse } from '../types';

type GuardTab = 'simulator' | 'crisis';

export const BrandGuard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuardTab>('simulator');
  
  // Simulator State
  const [draftPost, setDraftPost] = useState('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Crisis State
  const [crisisSituation, setCrisisSituation] = useState('');
  const [crisisResponses, setCrisisResponses] = useState<CrisisResponse[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  const handleSimulate = async () => {
    if (!draftPost) return;
    setIsSimulating(true);
    const result = await simulatePublicReaction(draftPost);
    setSimulation(result);
    setIsSimulating(false);
  };

  const handleCrisisGen = async () => {
    if (!crisisSituation) return;
    setIsGeneratingResponse(true);
    const results = await generateCrisisResponse(crisisSituation);
    setCrisisResponses(results);
    setIsGeneratingResponse(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Controls & Input */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-surface border border-slate-700 rounded-xl p-1 overflow-hidden flex">
           <button 
             onClick={() => setActiveTab('simulator')}
             className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                 activeTab === 'simulator' ? 'bg-slate-700 text-white shadow-lg' : 'text-muted hover:text-white'
             }`}
           >
              <i className="fa-solid fa-flask"></i> Simulator
           </button>
           <button 
             onClick={() => setActiveTab('crisis')}
             className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                 activeTab === 'crisis' ? 'bg-red-500/20 text-red-500 shadow-lg border border-red-500/20' : 'text-muted hover:text-red-400'
             }`}
           >
              <i className="fa-solid fa-triangle-exclamation"></i> Crisis Mode
           </button>
        </div>

        {activeTab === 'simulator' ? (
             <div className="bg-surface rounded-xl border border-slate-700 p-6 flex-1 flex flex-col">
                 <div className="mb-4">
                     <h3 className="text-lg font-bold mb-1">Pre-Viral Simulator</h3>
                     <p className="text-xs text-muted">Test your content against AI archetypes before you post.</p>
                 </div>
                 <textarea 
                     value={draftPost}
                     onChange={(e) => setDraftPost(e.target.value)}
                     placeholder="Paste your draft tweet, caption, or statement here..."
                     className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-sm resize-none focus:border-primary outline-none mb-4"
                 />
                 <button 
                     onClick={handleSimulate}
                     disabled={isSimulating || !draftPost}
                     className="w-full py-4 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 rounded-xl font-bold text-white shadow-xl transition-all"
                 >
                     {isSimulating ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Running Simulation...</> : 'Run Simulation'}
                 </button>
             </div>
        ) : (
            <div className="bg-red-950/20 rounded-xl border border-red-900/50 p-6 flex-1 flex flex-col">
                 <div className="mb-4">
                     <h3 className="text-lg font-bold text-red-500 mb-1 flex items-center gap-2">
                         <i className="fa-solid fa-biohazard"></i> The War Room
                     </h3>
                     <p className="text-xs text-red-200/70">Generate strategic de-escalation statements instantly.</p>
                 </div>
                 <textarea 
                     value={crisisSituation}
                     onChange={(e) => setCrisisSituation(e.target.value)}
                     placeholder="Describe the crisis (e.g. 'Users are angry about the price hike' or 'The server is down')..."
                     className="flex-1 bg-black/40 border border-red-900/50 rounded-lg p-4 text-sm resize-none focus:border-red-500 outline-none mb-4 text-red-100 placeholder-red-900/50"
                 />
                 <button 
                     onClick={handleCrisisGen}
                     disabled={isGeneratingResponse || !crisisSituation}
                     className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-xl transition-all shadow-red-900/20"
                 >
                     {isGeneratingResponse ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Drafting Response...</> : 'Generate Response Strategy'}
                 </button>
            </div>
        )}
      </div>

      {/* Output / Visualization */}
      <div className="lg:col-span-2 bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          {activeTab === 'simulator' && (
              <div className="relative z-10 h-full flex flex-col">
                  {!simulation ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-muted p-12 text-center opacity-50">
                          <i className="fa-solid fa-users-viewfinder text-6xl mb-6"></i>
                          <h3 className="text-xl font-bold mb-2">Ready to Simulate</h3>
                          <p>Enter a draft to see how the internet might react.</p>
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col overflow-y-auto">
                          {/* Score Header */}
                          <div className="p-8 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
                              <div>
                                  <div className="flex items-center gap-3 mb-2">
                                      <h2 className="text-2xl font-bold">Controversy Score</h2>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                          simulation.riskLevel === 'Safe' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                          simulation.riskLevel === 'Moderate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                          'bg-red-500/10 text-red-500 border-red-500/20'
                                      }`}>
                                          {simulation.riskLevel}
                                      </span>
                                  </div>
                                  <p className="text-slate-300 max-w-lg leading-relaxed">{simulation.analysis}</p>
                              </div>
                              
                              {/* Gauge Visual */}
                              <div className="relative w-32 h-32 flex items-center justify-center">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                      <path
                                          className="text-slate-700"
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                      />
                                      <path
                                          className={`${
                                              simulation.controversyScore < 30 ? 'text-emerald-500' :
                                              simulation.controversyScore < 70 ? 'text-amber-500' : 'text-red-600'
                                          } transition-all duration-1000 ease-out`}
                                          strokeDasharray={`${simulation.controversyScore}, 100`}
                                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                      />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                                      <span className="text-3xl font-bold">{simulation.controversyScore}</span>
                                  </div>
                              </div>
                          </div>

                          {/* Comments Feed */}
                          <div className="p-8 bg-slate-900/30 flex-1">
                              <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-6">Simulated Public Response</h4>
                              <div className="space-y-4 max-w-2xl mx-auto">
                                  {simulation.predictedComments.map((comment, i) => (
                                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-surface border border-slate-700 shadow-sm animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                              comment.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                                              comment.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                              'bg-slate-700 text-slate-300'
                                          }`}>
                                              <i className={`fa-solid ${
                                                  comment.sentiment === 'positive' ? 'fa-heart' :
                                                  comment.sentiment === 'negative' ? 'fa-fire' : 'fa-user'
                                              }`}></i>
                                          </div>
                                          <div>
                                              <div className="flex items-center gap-2 mb-1">
                                                  <span className="font-bold text-sm text-white">{comment.persona}</span>
                                                  <span className="text-xs text-muted">{comment.handle}</span>
                                              </div>
                                              <p className="text-sm text-slate-200 mb-2">{comment.comment}</p>
                                              <div className="flex gap-4 text-xs text-muted font-medium">
                                                  <span><i className="fa-regular fa-heart mr-1"></i> {comment.likes}</span>
                                                  <span>Reply</span>
                                                  <span>Share</span>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'crisis' && (
              <div className="relative z-10 h-full p-8 flex flex-col bg-red-950/5">
                  {!crisisResponses.length ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-red-300/50 p-12 text-center">
                          <i className="fa-solid fa-shield-cat text-6xl mb-6"></i>
                          <h3 className="text-xl font-bold mb-2">Crisis Mode Standby</h3>
                          <p>Describe the issue to generate immediate response options.</p>
                      </div>
                  ) : (
                      <div className="flex-1 overflow-y-auto space-y-6">
                           <div className="flex items-center gap-3 mb-6">
                               <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center text-white animate-pulse">
                                   <i className="fa-solid fa-bullhorn"></i>
                               </div>
                               <div>
                                   <h2 className="text-xl font-bold text-white">Strategic Response Options</h2>
                                   <p className="text-red-300/70 text-sm">Choose the approach that fits your brand voice.</p>
                               </div>
                           </div>

                           <div className="grid grid-cols-1 gap-6">
                               {crisisResponses.map((resp, i) => (
                                   <div key={i} className="bg-black/40 border border-red-900/30 rounded-xl p-6 hover:border-red-500/50 transition-colors group">
                                       <div className="flex justify-between items-center mb-4">
                                           <div className="flex items-center gap-2">
                                               <span className="text-red-500 font-bold text-sm uppercase tracking-wider border border-red-500/30 px-2 py-0.5 rounded">Option {i+1}</span>
                                               <h3 className="font-bold text-white">{resp.strategy}</h3>
                                           </div>
                                           <span className="text-xs text-muted bg-slate-800 px-2 py-1 rounded">{resp.tone} Tone</span>
                                       </div>
                                       <div className="bg-surface p-4 rounded-lg border border-slate-700 text-slate-200 text-sm leading-relaxed mb-4 font-medium">
                                           "{resp.content}"
                                       </div>
                                       <div className="flex justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                           <button className="text-xs text-muted hover:text-white flex items-center gap-1"><i className="fa-regular fa-copy"></i> Copy</button>
                                           <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><i className="fa-solid fa-paper-plane"></i> Send to Approval</button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};