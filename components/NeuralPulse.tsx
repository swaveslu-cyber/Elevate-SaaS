
import React, { useState, useEffect } from 'react';
import { generatePulseInsights } from '../services/geminiService';
import { Page } from '../types';

interface NeuralPulseProps {
    currentPage: Page;
}

export const NeuralPulse: React.FC<NeuralPulseProps> = ({ currentPage }) => {
    const [insight, setInsight] = useState("Monitoring neural pathways...");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            setIsRefreshing(true);
            const text = await generatePulseInsights(currentPage);
            if (text) {
                setInsight(text);
            }
            setIsRefreshing(false);
        };

        fetchInsight();
        // Poll every 30s
        const interval = setInterval(fetchInsight, 30000); 
        
        return () => {
            clearInterval(interval);
        };
    }, [currentPage]);

    return (
        <div className="h-7 bg-slate-950 border-t border-slate-800 flex items-center px-4 justify-between relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none bg-indigo-500/5"></div>
            
            <div className="flex items-center gap-3 relative z-10 overflow-hidden">
                <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full bg-indigo-500 ${isRefreshing ? 'animate-ping' : ''}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                        Neural Pulse
                    </span>
                </div>
                
                <div className="h-3 w-px bg-slate-800 shrink-0"></div>
                
                <div className="flex-1 overflow-hidden">
                    <p className={`text-[10px] font-mono italic animate-fade-in-right truncate transition-all duration-500 text-slate-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                        {insight}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-[9px] font-mono relative z-10 shrink-0 ml-4">
                <span className="text-slate-600 hidden md:inline">CPU: <span className="text-emerald-500">14%</span></span>
                <span className="text-slate-600 hidden md:inline">MEM: <span className="text-blue-500">2.4GB</span></span>
                <span className="font-bold transition-colors uppercase text-slate-400 group-hover:text-indigo-400">
                    Core_3.0_Link: OK
                </span>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none opacity-20"></div>
        </div>
    );
};
