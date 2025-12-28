import React, { useState } from 'react';
import { analyzeWritingStyle, generateReplicaContent } from '../services/geminiService';
import { VoiceFingerprint } from '../types';

export const TheScribe: React.FC = () => {
  const [samples, setSamples] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fingerprint, setFingerprint] = useState<VoiceFingerprint | null>(null);
  
  const [ghostTopic, setGhostTopic] = useState('');
  const [isGhostwriting, setIsGhostwriting] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const handleAnalyze = async () => {
      if (!samples) return;
      setIsAnalyzing(true);
      setFingerprint(null);
      setSaveStatus('idle');
      
      const result = await analyzeWritingStyle(samples);
      setFingerprint(result);
      setIsAnalyzing(false);
  };

  const handleGhostwrite = async () => {
      if (!fingerprint || !ghostTopic) return;
      setIsGhostwriting(true);
      setGeneratedText('');
      
      const result = await generateReplicaContent(fingerprint, ghostTopic);
      setGeneratedText(result);
      setIsGhostwriting(false);
  };

  const handleSaveToCore = () => {
      if (!fingerprint) return;
      localStorage.setItem('elevate_voice_fingerprint', JSON.stringify(fingerprint));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
        
        {/* Left: Input & Analysis */}
        <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-surface rounded-xl border border-slate-700 p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-white">
                        <i className="fa-solid fa-feather-pointed"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Scribe</h2>
                        <p className="text-xs text-muted">Voice Cloning Engine</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <label className="text-xs font-bold uppercase text-muted tracking-widest">Training Data</label>
                    <textarea 
                        value={samples}
                        onChange={(e) => setSamples(e.target.value)}
                        placeholder="Paste samples of your writing here (blogs, emails, posts) to train the model..."
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-xl p-4 text-sm focus:border-white outline-none resize-none min-h-[300px]"
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !samples}
                        className="w-full py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-fingerprint"></i>}
                        Extract Voice Fingerprint
                    </button>
                </div>
            </div>
        </div>

        {/* Right: Profile & Ghostwriter */}
        <div className="flex-1 bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col relative">
            {!fingerprint ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40">
                    <i className="fa-solid fa-signature text-6xl mb-4"></i>
                    <p className="text-lg">Waiting for voice samples.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* Header Profile */}
                    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-transparent">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Detected Archetype</span>
                                <h2 className="text-2xl font-bold text-white">{fingerprint.archetype}</h2>
                            </div>
                            <button 
                                onClick={handleSaveToCore} 
                                className={`text-xs font-bold px-4 py-2 rounded transition-all flex items-center gap-2 ${
                                    saveStatus === 'saved' 
                                    ? 'bg-emerald-500 text-white shadow-lg' 
                                    : 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                                }`}
                            >
                                {saveStatus === 'saved' ? <><i className="fa-solid fa-check"></i> Saved to Core</> : 'Save to Core'}
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                            {fingerprint.traits.map((trait, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-300">
                                    {trait}
                                </span>
                            ))}
                        </div>

                        {/* Metrics Visualizer */}
                        <div className="grid grid-cols-4 gap-4 mt-6">
                            {Object.entries(fingerprint.metrics).map(([key, val]) => (
                                <div key={key}>
                                    <div className="flex justify-between text-[10px] uppercase text-muted font-bold mb-1">
                                        <span>{key}</span>
                                        <span>{val}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-white rounded-full" style={{width: `${val}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ghostwriter Interface */}
                    <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={ghostTopic}
                                onChange={(e) => setGhostTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGhostwrite()}
                                placeholder="What should I write about in your voice?"
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:border-white outline-none"
                            />
                            <button 
                                onClick={handleGhostwrite}
                                disabled={isGhostwriting || !ghostTopic}
                                className="px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                {isGhostwriting ? <i className="fa-solid fa-pen-fancy fa-bounce"></i> : 'Write'}
                            </button>
                        </div>

                        <div className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl p-6 overflow-y-auto relative">
                            {generatedText ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap leading-relaxed">{generatedText}</p>
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted opacity-30">
                                    <p>Ghostwriter Ready</p>
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