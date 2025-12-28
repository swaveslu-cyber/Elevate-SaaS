import React, { useState } from 'react';
import { generatePitchDeck, roastPitch } from '../services/geminiService';
import { PitchDeck, PitchSlide } from '../types';

export const ThePitch: React.FC = () => {
  const [pitchType, setPitchType] = useState('Investor Pitch');
  const [target, setTarget] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deck, setDeck] = useState<PitchDeck | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [roast, setRoast] = useState<string | null>(null);
  const [isRoasting, setIsRoasting] = useState(false);

  const handleGenerate = async () => {
      if (!target || !valueProp) return;
      setIsGenerating(true);
      setDeck(null);
      setRoast(null);
      setActiveSlideIndex(0);
      const result = await generatePitchDeck(pitchType, target, valueProp);
      setDeck(result);
      setIsGenerating(false);
  };

  const handleRoast = async () => {
      if (!deck) return;
      setIsRoasting(true);
      const critique = await roastPitch(deck.slides);
      setRoast(critique);
      setIsRoasting(false);
  };

  const nextSlide = () => {
      if (deck && activeSlideIndex < deck.slides.length - 1) {
          setActiveSlideIndex(prev => prev + 1);
      }
  };

  const prevSlide = () => {
      if (activeSlideIndex > 0) {
          setActiveSlideIndex(prev => prev - 1);
      }
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       {/* Config Bar */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-2">Pitch Type</label>
                    <select 
                        value={pitchType} 
                        onChange={(e) => setPitchType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                    >
                        <option>Investor Pitch</option>
                        <option>Sponsorship Deal</option>
                        <option>Client Proposal</option>
                        <option>Partnership</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-2">Target Audience</label>
                    <input 
                        type="text" 
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="e.g. 'Sequoia Capital', 'Nike Brand Team'"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-muted uppercase mb-2">Core Value Prop</label>
                    <input 
                        type="text" 
                        value={valueProp}
                        onChange={(e) => setValueProp(e.target.value)}
                        placeholder="e.g. 'AI that writes code 10x faster'"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none"
                    />
                </div>
            </div>
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !target}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
            >
                {isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Architect Deck'}
            </button>
       </div>

       {/* Presentation Stage */}
       <div className="flex-1 flex gap-6 overflow-hidden">
            {!deck ? (
                <div className="flex-1 bg-surface border border-slate-700 rounded-xl flex flex-col items-center justify-center text-muted opacity-50">
                    <i className="fa-solid fa-person-chalkboard text-6xl mb-4"></i>
                    <p>Enter pitch details to generate slides.</p>
                </div>
            ) : (
                <>
                    {/* Main Slide View */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex-1 bg-white text-black rounded-xl shadow-2xl overflow-hidden relative flex flex-col p-12 border-8 border-slate-800">
                            {/* Slide Content */}
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-4xl font-extrabold mb-8 text-slate-900 leading-tight">
                                    {deck.slides[activeSlideIndex].title}
                                </h1>
                                <ul className="space-y-4">
                                    {deck.slides[activeSlideIndex].bullets.map((bullet, i) => (
                                        <li key={i} className="text-xl text-slate-700 flex items-start gap-3">
                                            <span className="text-indigo-600 mt-1">•</span>
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Visual Prompt Overlay (for designer) */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 border-dashed flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                        <i className="fa-regular fa-image text-xl"></i>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visual Concept</span>
                                        <p className="text-sm text-gray-700 italic">{deck.slides[activeSlideIndex].visualCue}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Slide Number */}
                            <div className="absolute bottom-4 right-6 text-gray-400 font-bold text-lg">
                                {activeSlideIndex + 1} / {deck.slides.length}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-between items-center bg-surface border border-slate-700 p-4 rounded-xl">
                            <button 
                                onClick={prevSlide} 
                                disabled={activeSlideIndex === 0}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-left"></i> Prev
                            </button>
                            
                            <div className="flex gap-2">
                                {deck.slides.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-2 h-2 rounded-full transition-colors ${i === activeSlideIndex ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={nextSlide}
                                disabled={activeSlideIndex === deck.slides.length - 1}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-colors"
                            >
                                Next <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Speaker Notes & Roast Panel */}
                    <div className="w-80 flex flex-col gap-4">
                        <div className="bg-surface border border-slate-700 rounded-xl p-6 flex-1 flex flex-col overflow-hidden">
                            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-microphone-lines"></i> Speaker Notes
                            </h3>
                            <div className="flex-1 overflow-y-auto pr-2">
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {deck.slides[activeSlideIndex].speakerNotes}
                                </p>
                            </div>
                        </div>

                        <div className={`rounded-xl p-6 border transition-all ${
                            roast ? 'bg-red-950/30 border-red-500/50' : 'bg-surface border-slate-700'
                        }`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                    <i className="fa-solid fa-fire text-red-500"></i> The Shark Tank
                                </h3>
                                <button 
                                    onClick={handleRoast}
                                    disabled={isRoasting}
                                    className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded font-bold transition-colors"
                                >
                                    {isRoasting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Roast Me'}
                                </button>
                            </div>
                            
                            {roast ? (
                                <div className="text-sm text-red-200 leading-relaxed italic bg-black/20 p-3 rounded border border-red-500/20">
                                    "{roast}"
                                </div>
                            ) : (
                                <p className="text-xs text-muted text-center py-4">
                                    Ask the AI to brutally critique your pitch logic.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
       </div>
    </div>
  );
};