import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createSmartInvoice, analyzeContract } from '../services/geminiService';
import { InvoiceDetails, LegalRisk } from '../types';

const REVENUE_DATA = [
  { name: 'Jan', revenue: 12500, expenses: 4200 },
  { name: 'Feb', revenue: 15000, expenses: 4500 },
  { name: 'Mar', revenue: 14200, expenses: 4800 },
  { name: 'Apr', revenue: 18500, expenses: 5100 },
  { name: 'May', revenue: 16800, expenses: 4900 },
  { name: 'Jun', revenue: 21000, expenses: 5500 },
];

const INITIAL_INVOICES: InvoiceDetails[] = [
    { id: 'INV-001', client: 'Acme Corp', amount: '$2,500', date: 'Due in 2 days', status: 'pending', description: 'Monthly Retainer' },
    { id: 'INV-002', client: 'Stark Ind', amount: '$5,000', date: 'Overdue', status: 'overdue', description: 'Rebranding Project' },
    { id: 'INV-003', client: 'Wayne Ent', amount: '$8,200', date: 'Paid', status: 'paid', description: 'Social Audit' },
];

export const BusinessOps: React.FC = () => {
    // Time Tracker State
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [activeTask, setActiveTask] = useState('Content Strategy - Acme Corp');
    
    // Invoice State
    const [invoices, setInvoices] = useState<InvoiceDetails[]>(INITIAL_INVOICES);
    const [invoicePrompt, setInvoicePrompt] = useState('');
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

    // Legal State
    const [contractText, setContractText] = useState('');
    const [isAnalyzingContract, setIsAnalyzingContract] = useState(false);
    const [legalRisk, setLegalRisk] = useState<LegalRisk | null>(null);

    useEffect(() => {
        let interval: any = null;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isTimerRunning && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, seconds]);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCreateInvoice = async () => {
        if (!invoicePrompt) return;
        setIsGeneratingInvoice(true);
        const newInvoice = await createSmartInvoice(invoicePrompt);
        if (newInvoice) {
            // Ensure unique ID in case of duplication mock
            newInvoice.id = `INV-${Math.floor(Math.random() * 1000)}`;
            setInvoices([newInvoice, ...invoices]);
            setInvoicePrompt('');
        }
        setIsGeneratingInvoice(false);
    };

    const handleAnalyzeContract = async () => {
        if (!contractText) return;
        setIsAnalyzingContract(true);
        const result = await analyzeContract(contractText);
        setLegalRisk(result);
        setIsAnalyzingContract(false);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Top Row: Time Tracker & Financial Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Time Tracker Widget */}
                <div className="bg-surface rounded-xl border border-slate-700 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <i className="fa-solid fa-stopwatch text-6xl"></i>
                    </div>
                    <h3 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wider">Active Session</h3>
                    
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="text-5xl font-mono font-bold tracking-widest mb-2 text-text">
                            {formatTime(seconds)}
                        </div>
                        <input 
                            type="text" 
                            value={activeTask}
                            onChange={(e) => setActiveTask(e.target.value)}
                            className="bg-transparent text-center text-sm text-muted border-b border-transparent hover:border-slate-600 focus:border-primary outline-none transition-colors w-full"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                                isTimerRunning 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                                : 'bg-secondary text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                            }`}
                        >
                            <i className={`fa-solid ${isTimerRunning ? 'fa-pause' : 'fa-play'}`}></i>
                            {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
                        </button>
                    </div>
                </div>

                {/* Financial Health */}
                <div className="lg:col-span-2 bg-surface rounded-xl border border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">Financial Overview</h3>
                        <div className="flex gap-2">
                             <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+12% vs last month</span>
                        </div>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Middle Row: Smart Invoicing */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                        <h3 className="font-semibold text-lg mb-4">Smart Invoice Architect</h3>
                        <div className="relative">
                            <input 
                                type="text"
                                value={invoicePrompt}
                                onChange={(e) => setInvoicePrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateInvoice()}
                                placeholder="e.g. Bill Cyberdyne $4,500 for Q4 audit, due in 30 days..."
                                className="w-full bg-slate-950 border border-slate-600 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner"
                            />
                            <button 
                                onClick={handleCreateInvoice}
                                disabled={isGeneratingInvoice || !invoicePrompt}
                                className="absolute right-2 top-1.5 bottom-1.5 bg-primary hover:bg-indigo-600 text-white px-3 rounded text-xs font-bold transition-colors disabled:opacity-50"
                            >
                                {isGeneratingInvoice ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Create'}
                            </button>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-700 overflow-y-auto max-h-[300px]">
                        {invoices.map(inv => (
                            <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors animate-fade-in">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded flex items-center justify-center text-lg ${
                                        inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                        inv.status === 'overdue' ? 'bg-red-500/10 text-red-500' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        <i className="fa-solid fa-file-invoice-dollar"></i>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-text">{inv.client}</p>
                                        <p className="text-xs text-muted">{inv.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-text">{inv.amount}</p>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                        inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                        inv.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                                        'bg-amber-500/10 text-amber-500'
                                    }`}>
                                        {inv.date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legal Guardian Module */}
                <div className="bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900">
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <i className="fa-solid fa-scale-balanced text-accent"></i> Legal Guardian
                            </h3>
                            <p className="text-xs text-muted">AI Contract Review & Risk Detection</p>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        {!legalRisk ? (
                            <div className="flex-1 flex flex-col gap-4">
                                <textarea 
                                    className="flex-1 w-full bg-slate-950 border border-slate-600 rounded-lg p-4 text-xs font-mono text-slate-300 focus:border-accent outline-none resize-none"
                                    placeholder="Paste contract clauses here..."
                                    value={contractText}
                                    onChange={(e) => setContractText(e.target.value)}
                                ></textarea>
                                <button 
                                    onClick={handleAnalyzeContract}
                                    disabled={isAnalyzingContract || !contractText}
                                    className="w-full py-3 bg-gradient-to-r from-accent to-purple-600 hover:opacity-90 text-white rounded-lg font-bold shadow-lg transition-all"
                                >
                                    {isAnalyzingContract ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Analyzing...</> : 'Scan for Risks'}
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in space-y-4">
                                {/* Risk Score Header */}
                                <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                                    legalRisk.riskLevel === 'High' ? 'bg-red-500/10 border-red-500/30' : 
                                    legalRisk.riskLevel === 'Medium' ? 'bg-amber-500/10 border-amber-500/30' : 
                                    'bg-emerald-500/10 border-emerald-500/30'
                                }`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 ${
                                         legalRisk.riskLevel === 'High' ? 'border-red-500 text-red-500' : 
                                         legalRisk.riskLevel === 'Medium' ? 'border-amber-500 text-amber-500' : 
                                         'border-emerald-500 text-emerald-500'
                                    }`}>
                                        {legalRisk.score}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Risk Level: {legalRisk.riskLevel}</h4>
                                        <p className="text-xs text-slate-300 leading-tight">{legalRisk.summary}</p>
                                    </div>
                                </div>

                                {/* Clauses */}
                                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                                    {legalRisk.flaggedClauses.map((clause, i) => (
                                        <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 mb-1">
                                                <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs"></i>
                                                <span className="text-xs font-bold text-amber-200">{clause.issue}</span>
                                            </div>
                                            <p className="text-xs text-muted italic mb-2 line-clamp-2">"{clause.original}"</p>
                                            <div className="bg-slate-700/50 p-2 rounded text-xs text-emerald-300">
                                                <span className="font-bold">Suggestion: </span>{clause.suggestion}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={() => setLegalRisk(null)}
                                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors"
                                >
                                    Scan Another
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};