
import React, { useState, useEffect } from 'react';
import { initiateSigmaDiscovery } from '../services/geminiService';
import { SigmaNiche } from '../types';

interface ProtocolSigmaProps {
    onPromote?: (niche: SigmaNiche) => void;
}

export const ProtocolSigma: React.FC<ProtocolSigmaProps> = ({ onPromote }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [niches, setNiches] = useState<SigmaNiche[]>([]);
    const [scanProgress, setScanProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const startScan = async () => {
        setIsScanning(true);
        setNiches([]);
        setScanProgress(0);
        setLogs(["> INITIALIZING_SIGMA_CORE", "> CONNECTING_TO_MARKET_NODES"]);
        
        const interval = setInterval(() => {
            setScanProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return p + 2;
            });
        }, 100);

        try {
            const result = await initiateSigmaDiscovery();
            setNiches(result);
            setLogs(prev => [...prev, "> SCAN_COMPLETE", "> STRATEGIC_GAPS_DETECTED", "> CORE_READY"]);
        } catch (e) {
            setLogs(prev => [...prev, "> SCAN_ERROR: NEURAL_LINK_FAILED"]);
        }
        setIsScanning(false);
    };

    return (
        <div className="h-full flex flex-col gap-6 select-none animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-full bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className={`w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-3xl shadow-lg ${isScanning ? 'animate-pulse' : ''}`}>
                                <i className="fa-solid fa-microchip-ai"></i>
                            </div>
                            {isScanning && (
                                <div className="absolute -inset-2 rounded-2xl border-2 border-emerald-500/20 animate-ping"></div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Protocol Sigma</h2>
                            <p className="text-xs text-emerald-400 font-mono tracking-widest flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></span>
                                STATUS: {isScanning ? 'AUTONOMOUS_SCAN_IN_PROGRESS' : 'STANDBY_CORE_READY'}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md w-full">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Sweep Progress</span>
                            <span className="text-[10px] font-mono text-emerald-500">{scanProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_#10b981]" style={{ width: `${scanProgress}%` }}></div>
                        </div>
                    </div>

                    <button 
                        onClick={startScan}
                        disabled={isScanning}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        Manual Sweep
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                <div className="lg:col-span-4 bg-black border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System_Log</h3>
                        <i className="fa-solid fa-terminal text-emerald-500 text-[10px]"></i>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 custom-scrollbar bg-slate-950/50">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 opacity-80 animate-fade-in-right">
                                <span className="text-slate-700 shrink-0">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                <span className={log.includes('COMPLETE') ? 'text-emerald-400' : 'text-slate-400'}>{log}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Strategic Gaps Detected</h3>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Targeting_High_ROI_Zones</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {niches.length === 0 && !isScanning ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
                                <i className="fa-solid fa-radar text-4xl mb-4"></i>
                                <p className="text-xs font-black uppercase tracking-widest">No Intelligence Collected</p>
                            </div>
                        ) : (
                            niches.map((niche, idx) => (
                                <div key={niche.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">GAP_IDENTIFIED</span>
                                                <span className="text-slate-600 font-mono text-[10px]">{niche.timestamp}</span>
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tighter italic">{niche.title}</h4>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-4">{niche.description}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                                    <h5 className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">Why Now?</h5>
                                                    <p className="text-xs text-slate-300">{niche.whyNow}</p>
                                                </div>
                                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                                    <h5 className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">The Exploit</h5>
                                                    <p className="text-xs text-slate-300">{niche.strategicGap}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:w-48 shrink-0 flex flex-col gap-4">
                                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase">Growth Pot.</span>
                                                    <span className="text-lg font-mono font-bold text-emerald-400">{niche.growthScore}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${niche.growthScore}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase">Resonance</span>
                                                    <span className="text-lg font-mono font-bold text-indigo-400">{niche.resonanceScore}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${niche.resonanceScore}%` }}></div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onPromote?.(niche)}
                                                className="flex-1 w-full bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors py-3 shadow-xl"
                                            >
                                                Promote to Alpha
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
