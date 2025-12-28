import React, { useState, useEffect } from 'react';

const ARCHETYPES = [
    { id: 'sage', label: 'The Sage', desc: 'Knowledgeable, Trustworthy, Calm', icon: 'fa-book-open' },
    { id: 'rebel', label: 'The Rebel', desc: 'Bold, Disruptive, High Energy', icon: 'fa-bolt' },
    { id: 'jester', label: 'The Jester', desc: 'Humorous, Playful, Witty', icon: 'fa-masks-theater' },
    { id: 'caregiver', label: 'The Caregiver', desc: 'Supportive, Empathetic, Warm', icon: 'fa-hand-holding-heart' },
    { id: 'creator', label: 'The Creator', desc: 'Innovative, Artistic, Visionary', icon: 'fa-palette' },
];

export const Settings: React.FC = () => {
  const [brandName, setBrandName] = useState('Elevate Tech');
  const [industry, setIndustry] = useState('SaaS / AI');
  const [selectedArchetype, setSelectedArchetype] = useState('creator');
  const [mission, setMission] = useState('');
  
  // Voice Sliders (0 - 100)
  const [voiceProfessional, setVoiceProfessional] = useState(70); // vs Casual
  const [voiceEnergetic, setVoiceEnergetic] = useState(60); // vs Calm
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('elevate_brand_dna');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            setBrandName(parsed.brandName || 'Elevate Tech');
            setIndustry(parsed.industry || 'SaaS / AI');
            setSelectedArchetype(parsed.selectedArchetype || 'creator');
            setMission(parsed.mission || '');
            setVoiceProfessional(parsed.voiceProfessional ?? 70);
            setVoiceEnergetic(parsed.voiceEnergetic ?? 60);
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Persist to Local Storage
    const settings = {
        brandName,
        industry,
        selectedArchetype,
        mission,
        voiceProfessional,
        voiceEnergetic
    };
    
    localStorage.setItem('elevate_brand_dna', JSON.stringify(settings));

    // Simulate API delay
    setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <i className="fa-solid fa-microchip text-3xl text-white"></i>
            </div>
            <div>
                <h2 className="text-3xl font-bold">Neural Core</h2>
                <p className="text-muted">Configure the DNA of your AI Operating System.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Core Identity */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Brand Identity Card */}
                <div className="bg-surface border border-slate-700 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-fingerprint text-primary"></i> Brand Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-2">Brand Name</label>
                            <input 
                                type="text" 
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase mb-2">Industry</label>
                            <input 
                                type="text" 
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-xs font-bold text-muted uppercase mb-2">Mission Statement</label>
                             <textarea 
                                value={mission}
                                onChange={(e) => setMission(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none h-20"
                                placeholder="e.g. To democratize access to artificial intelligence..."
                             ></textarea>
                        </div>
                    </div>
                </div>

                {/* Voice Tuning */}
                <div className="bg-surface border border-slate-700 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-accent"></i> Voice Tuning
                    </h3>
                    
                    <div className="space-y-8">
                        {/* Slider 1 */}
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className={voiceProfessional < 50 ? 'text-white' : 'text-muted'}>Casual</span>
                                <span className={voiceProfessional > 50 ? 'text-white' : 'text-muted'}>Professional</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={voiceProfessional}
                                onChange={(e) => setVoiceProfessional(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Slider 2 */}
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className={voiceEnergetic < 50 ? 'text-white' : 'text-muted'}>Calm</span>
                                <span className={voiceEnergetic > 50 ? 'text-white' : 'text-muted'}>Energetic</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={voiceEnergetic}
                                onChange={(e) => setVoiceEnergetic(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* API Status */}
                <div className="bg-surface border border-slate-700 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-server text-emerald-400"></i> System Status
                    </h3>
                    <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <div>
                                <p className="font-bold text-sm text-white">Gemini API Connected</p>
                                <p className="text-xs text-muted">Latency: ~120ms • Model: gemini-3-flash</p>
                            </div>
                        </div>
                        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">
                            {process.env.API_KEY ? '••••••••' + process.env.API_KEY.slice(-4) : 'Not Configured'}
                        </span>
                    </div>
                </div>

            </div>

            {/* Right Column: Archetypes */}
            <div className="bg-surface border border-slate-700 rounded-xl p-6 h-fit">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-user-astronaut text-indigo-400"></i> Brand Archetype
                </h3>
                <p className="text-xs text-muted mb-4">Select the base personality model for your AI.</p>
                
                <div className="space-y-3">
                    {ARCHETYPES.map(arch => (
                        <div 
                            key={arch.id}
                            onClick={() => setSelectedArchetype(arch.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                selectedArchetype === arch.id 
                                ? 'bg-primary/20 border-primary shadow-md' 
                                : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    selectedArchetype === arch.id ? 'bg-primary text-white' : 'bg-slate-700 text-muted'
                                }`}>
                                    <i className={`fa-solid ${arch.icon}`}></i>
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm ${selectedArchetype === arch.id ? 'text-white' : 'text-slate-200'}`}>{arch.label}</h4>
                                    <p className="text-[10px] text-muted">{arch.desc}</p>
                                </div>
                                {selectedArchetype === arch.id && (
                                    <i className="fa-solid fa-check text-primary ml-auto"></i>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-6 bg-surface/90 backdrop-blur-md border border-slate-700 rounded-xl p-4 flex justify-between items-center shadow-2xl z-20">
            <div className="text-xs text-muted">
                <i className="fa-solid fa-circle-info mr-1"></i>
                Settings persist to local storage and affect all generation modules.
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-muted hover:text-white transition-colors">Discard</button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg font-bold text-sm text-white shadow-lg transition-all flex items-center gap-2 ${
                        saveSuccess 
                        ? 'bg-emerald-500 hover:bg-emerald-600' 
                        : 'bg-primary hover:bg-indigo-600'
                    }`}
                >
                    {isSaving ? (
                        <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving...</>
                    ) : saveSuccess ? (
                        <><i className="fa-solid fa-check"></i> Applied</>
                    ) : (
                        'Save Configuration'
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};