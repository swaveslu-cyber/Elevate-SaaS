import React, { useState } from 'react';
import { generateNewsletter } from '../services/geminiService';
import { Newsletter } from '../types';

export const TheCurator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [isCurating, setIsCurating] = useState(false);
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);

  const handleCurate = async () => {
      if (!topic || !audience) return;
      setIsCurating(true);
      setNewsletter(null);
      const result = await generateNewsletter(topic, audience);
      setNewsletter(result);
      setIsCurating(false);
  };

  const copyHTML = () => {
      // Mock HTML copy
      alert("HTML Copied to Clipboard!");
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
       
       {/* Configuration */}
       <div className="lg:w-1/3 flex flex-col gap-6">
           <div className="bg-surface rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <i className="fa-solid fa-newspaper"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Curator</h2>
                        <p className="text-sm text-muted">AI Newsletter Engine</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Topic / Niche</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. 'Generative AI Tools'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Target Audience</label>
                        <input 
                            type="text" 
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="e.g. 'Marketing Professionals'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:border-orange-500 outline-none"
                        />
                    </div>
                    <button 
                        onClick={handleCurate}
                        disabled={isCurating || !topic || !audience}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isCurating ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Researching...</> : 'Curate Issue'}
                    </button>
                </div>
           </div>

           {/* Source List (Visible after generation) */}
           {newsletter && (
               <div className="flex-1 bg-surface rounded-xl border border-slate-700 p-4 overflow-y-auto">
                   <h3 className="text-sm font-bold text-white mb-3">Sources Found</h3>
                   <div className="space-y-3">
                       {newsletter.items.map((item, i) => (
                           <a key={i} href={item.url} target="_blank" rel="noreferrer" className="block p-3 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700 transition-colors">
                               <div className="text-xs text-orange-400 font-bold mb-1">{item.source}</div>
                               <div className="text-xs text-slate-300 line-clamp-2">{item.title}</div>
                           </a>
                       ))}
                   </div>
               </div>
           )}
       </div>

       {/* Preview Pane */}
       <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative border-8 border-slate-800">
            {!newsletter ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                    <i className="fa-regular fa-envelope-open text-6xl mb-4 opacity-20"></i>
                    <p className="font-bold text-lg opacity-50">Newsletter Preview</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 font-sans">
                    {/* Email Header */}
                    <div className="bg-slate-900 text-white p-8 text-center">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">Weekly Digest</div>
                        <h1 className="text-3xl font-serif font-bold">{newsletter.subject}</h1>
                    </div>

                    <div className="max-w-2xl mx-auto p-8">
                        {/* Intro */}
                        <div className="prose prose-slate mb-8">
                            <p className="text-lg leading-relaxed font-serif text-slate-700 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-1">
                                {newsletter.intro}
                            </p>
                        </div>

                        <hr className="border-slate-200 my-8" />

                        {/* News Items */}
                        <div className="space-y-8">
                            {newsletter.items.map((item, i) => (
                                <div key={i}>
                                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{item.source}</span>
                                    <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2 hover:text-orange-600 transition-colors">
                                        <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {item.summary}
                                    </p>
                                    <a href={item.url} className="text-orange-600 text-sm font-bold mt-2 inline-block hover:underline">Read more &rarr;</a>
                                </div>
                            ))}
                        </div>

                        <hr className="border-slate-200 my-8" />

                        {/* Outro */}
                        <div className="bg-slate-100 p-6 rounded-lg text-center">
                            <p className="text-slate-600 italic text-sm">{newsletter.outro}</p>
                            <div className="mt-4 text-xs text-slate-400 font-bold uppercase">Sent via Elevate OS</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions Toolbar */}
            {newsletter && (
                <div className="absolute bottom-6 right-6 flex gap-3">
                    <button onClick={copyHTML} className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors">
                        <i className="fa-solid fa-code mr-2"></i> Copy HTML
                    </button>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-orange-500 transition-colors">
                        <i className="fa-solid fa-paper-plane mr-2"></i> Send Test
                    </button>
                </div>
            )}
       </div>
    </div>
  );
};