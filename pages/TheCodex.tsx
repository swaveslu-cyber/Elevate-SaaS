import React, { useState, useEffect } from 'react';
import { CodexEntry, FactCheckResult } from '../types';
import { queryCodex, checkFacts } from '../services/geminiService';

export const TheCodex: React.FC = () => {
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [inputCategory, setInputCategory] = useState('Product');
  const [isAdding, setIsAdding] = useState(false);

  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const [verifyText, setVerifyText] = useState('');
  const [verifyResult, setVerifyResult] = useState<FactCheckResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load from local storage
  useEffect(() => {
      const stored = localStorage.getItem('elevate_codex');
      if (stored) {
          setEntries(JSON.parse(stored));
      } else {
          // Default data
          setEntries([{
              id: 'init',
              title: 'Brand Voice Guidelines',
              category: 'Brand',
              content: 'Our brand voice is witty, authoritative, and concise. We avoid jargon.',
              dateAdded: new Date().toISOString()
          }]);
      }
  }, []);

  // Save to local storage
  useEffect(() => {
      if (entries.length > 0) {
          localStorage.setItem('elevate_codex', JSON.stringify(entries));
      }
  }, [entries]);

  const handleAdd = () => {
      if (!inputTitle || !inputContent) return;
      setIsAdding(true);
      const newEntry: CodexEntry = {
          id: Math.random().toString(36).substr(2, 9),
          title: inputTitle,
          content: inputContent,
          category: inputCategory,
          dateAdded: new Date().toISOString()
      };
      setEntries([newEntry, ...entries]);
      setInputTitle('');
      setInputContent('');
      setIsAdding(false);
  };

  const handleDelete = (id: string) => {
      setEntries(entries.filter(e => e.id !== id));
  };

  const handleQuery = async () => {
      if (!query) return;
      setIsQuerying(true);
      const result = await queryCodex(query, entries);
      setQueryResult(result);
      setIsQuerying(false);
  };

  const handleVerify = async () => {
      if (!verifyText) return;
      setIsVerifying(true);
      const result = await checkFacts(verifyText, entries);
      setVerifyResult(result);
      setIsVerifying(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       <div className="flex gap-6 h-full">
           
           {/* Left: Knowledge Base */}
           <div className="w-1/3 flex flex-col gap-4">
               <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col h-full overflow-hidden">
                   <div className="mb-4">
                       <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                           <i className="fa-solid fa-book-journal-whills text-emerald-500"></i> The Codex
                       </h2>
                       <p className="text-xs text-muted">Brand Knowledge & Fact Repository</p>
                   </div>

                   {/* Add Form */}
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4 space-y-3">
                       <input 
                           type="text" 
                           placeholder="Title (e.g. 'Refund Policy')"
                           value={inputTitle}
                           onChange={e => setInputTitle(e.target.value)}
                           className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs focus:border-emerald-500 outline-none"
                       />
                       <textarea 
                           placeholder="Content / Fact / Policy..."
                           value={inputContent}
                           onChange={e => setInputContent(e.target.value)}
                           className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs focus:border-emerald-500 outline-none resize-none h-20"
                       />
                       <div className="flex gap-2">
                           <select 
                               value={inputCategory}
                               onChange={e => setInputCategory(e.target.value)}
                               className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs outline-none"
                           >
                               <option>Brand</option>
                               <option>Product</option>
                               <option>Policy</option>
                               <option>Legal</option>
                           </select>
                           <button 
                               onClick={handleAdd}
                               disabled={!inputTitle || !inputContent}
                               className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold disabled:opacity-50"
                           >
                               Add
                           </button>
                       </div>
                   </div>

                   {/* List */}
                   <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                       {entries.map(entry => (
                           <div key={entry.id} className="bg-slate-800 p-3 rounded border border-slate-700 hover:border-emerald-500/50 transition-colors group relative">
                               <button onClick={() => handleDelete(entry.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <i className="fa-solid fa-times"></i>
                               </button>
                               <div className="flex items-center gap-2 mb-1">
                                   <span className="text-[10px] uppercase font-bold bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">{entry.category}</span>
                                   <h4 className="font-bold text-sm text-white truncate w-32">{entry.title}</h4>
                               </div>
                               <p className="text-xs text-slate-400 line-clamp-2">{entry.content}</p>
                           </div>
                       ))}
                   </div>
               </div>
           </div>

           {/* Right: Interaction */}
           <div className="flex-1 flex flex-col gap-6">
               
               {/* Query Section */}
               <div className="bg-surface rounded-xl border border-slate-700 p-6 flex-1 flex flex-col">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                       <i className="fa-solid fa-magnifying-glass text-indigo-400"></i> Neural Retrieval
                   </h3>
                   <div className="flex gap-2 mb-4">
                       <input 
                           type="text" 
                           value={query}
                           onChange={e => setQuery(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleQuery()}
                           placeholder="Ask the Codex (e.g. 'What is our return policy?')"
                           className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                       />
                       <button 
                           onClick={handleQuery}
                           disabled={isQuerying || !query}
                           className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm"
                       >
                           {isQuerying ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Ask'}
                       </button>
                   </div>
                   
                   <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700 p-4 overflow-y-auto">
                       {queryResult ? (
                           <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{queryResult}</p>
                       ) : (
                           <div className="h-full flex items-center justify-center text-muted opacity-50 text-xs">
                               Ask a question to retrieve knowledge.
                           </div>
                       )}
                   </div>
               </div>

               {/* Fact Check Section */}
               <div className="bg-surface rounded-xl border border-slate-700 p-6 flex-1 flex flex-col">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                       <i className="fa-solid fa-shield-halved text-amber-400"></i> Fact Sentinel
                   </h3>
                   <div className="flex gap-4 h-full">
                       <div className="flex-1 flex flex-col">
                           <textarea 
                               value={verifyText}
                               onChange={e => setVerifyText(e.target.value)}
                               placeholder="Paste content here to verify against the Codex..."
                               className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-4 text-sm focus:border-amber-500 outline-none resize-none mb-3"
                           />
                           <button 
                               onClick={handleVerify}
                               disabled={isVerifying || !verifyText}
                               className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-sm"
                           >
                               {isVerifying ? 'Verifying...' : 'Check Facts'}
                           </button>
                       </div>
                       
                       <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700 p-4 overflow-y-auto">
                           {verifyResult ? (
                               <div className="space-y-4">
                                   <div className={`flex items-center gap-2 font-bold ${verifyResult.isAccurate ? 'text-emerald-400' : 'text-red-400'}`}>
                                       <i className={`fa-solid ${verifyResult.isAccurate ? 'fa-check-circle' : 'fa-circle-xmark'}`}></i>
                                       {verifyResult.isAccurate ? 'Verified Accurate' : 'Inconsistencies Found'}
                                   </div>
                                   
                                   {verifyResult.issues.map((issue, i) => (
                                       <div key={i} className="bg-slate-800 p-3 rounded border border-slate-600 text-xs">
                                           <p className="text-red-300 mb-1"><span className="font-bold">Issue:</span> {issue.statement}</p>
                                           <p className="text-emerald-300 mb-1"><span className="font-bold">Correction:</span> {issue.correction}</p>
                                           <p className="text-slate-500 italic">Source: {issue.source}</p>
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <div className="h-full flex items-center justify-center text-muted opacity-50 text-xs">
                                   Verify content against your database.
                               </div>
                           )}
                       </div>
                   </div>
               </div>

           </div>
       </div>
    </div>
  );
};