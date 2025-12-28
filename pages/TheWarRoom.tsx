
import React, { useState, useEffect, useRef } from 'react';
import { scanSentinel } from '../services/geminiService';
import { SentinelHit, StreamMessage, NeuralEvent } from '../types';

export const TheWarRoom: React.FC = () => {
    const [hits, setHits] = useState<SentinelHit[]>([]);
    const [messages, setMessages] = useState<StreamMessage[]>([]);
    const [events, setEvents] = useState<NeuralEvent[]>([]);
    const [radarRotation, setRadarRotation] = useState(0);
    const [singularityPower, setSingularityPower] = useState(42);
    
    const radarRef = useRef<HTMLCanvasElement>(null);
    const mapRef = useRef<HTMLCanvasElement>(null);

    // Initial Load & Simulation
    useEffect(() => {
        const init = async () => {
            const hitData = await scanSentinel("Global Content Trends");
            setHits(hitData);
            
            const archive = localStorage.getItem('elevate_neural_archive');
            if (archive) setEvents(JSON.parse(archive).slice(0, 8));
        };
        init();

        const chatInterval = setInterval(() => {
            const newMessage: StreamMessage = {
                id: Date.now().toString(),
                user: `Agent_${Math.floor(Math.random() * 1000)}`,
                text: ["Sentiment shifting positive.", "Market gap detected in AI-Video.", "Competitor X just launched.", "Viral potential increasing."][Math.floor(Math.random() * 4)],
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [newMessage, ...prev].slice(0, 15));
            setSingularityPower(p => Math.min(100, p + Math.random() * 0.5));
        }, 4000);

        const radarInterval = setInterval(() => {
            setRadarRotation(prev => (prev + 2) % 360);
        }, 50);

        return () => {
            clearInterval(chatInterval);
            clearInterval(radarInterval);
        };
    }, []);

    // Draw Dominance Map
    useEffect(() => {
        const canvas = mapRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const renderMap = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background world mesh (dots)
            ctx.fillStyle = '#1e293b';
            for (let x = 0; x < canvas.width; x += 15) {
                for (let y = 0; y < canvas.height; y += 15) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw "Dominance" areas (glowing blobs)
            const regions = [
                { x: 100, y: 100, r: 40, color: 'rgba(99, 102, 241, 0.2)' },
                { x: 300, y: 150, r: 60, color: 'rgba(16, 185, 129, 0.15)' },
                { x: 500, y: 80, r: 35, color: 'rgba(239, 68, 68, 0.1)' }
            ];

            regions.forEach(reg => {
                const grad = ctx.createRadialGradient(reg.x, reg.y, 0, reg.x, reg.y, reg.r);
                grad.addColorStop(0, reg.color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(reg.x, reg.y, reg.r, 0, Math.PI * 2);
                ctx.fill();

                // Draw pulsating node
                ctx.fillStyle = reg.color.replace('0.2', '0.8').replace('0.15', '0.8').replace('0.1', '0.8');
                ctx.beginPath();
                ctx.arc(reg.x, reg.y, 2 + Math.sin(Date.now() / 500) * 1, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connection lines
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(regions[0].x, regions[0].y);
            ctx.lineTo(regions[1].x, regions[1].y);
            ctx.lineTo(regions[2].x, regions[2].y);
            ctx.stroke();

            requestAnimationFrame(renderMap);
        };
        const anim = requestAnimationFrame(renderMap);
        return () => cancelAnimationFrame(anim);
    }, []);

    // Draw Radar logic
    useEffect(() => {
        const canvas = radarRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const size = canvas.width;
        const center = size / 2;
        ctx.clearRect(0, 0, size, size);

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.lineWidth = 1;
        for (let r = 1; r <= 3; r++) {
            ctx.beginPath();
            ctx.arc(center, center, (size / 6) * r, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate((radarRotation * Math.PI) / 180);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, center);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, center, -0.3, 0);
        ctx.lineTo(0, 0);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();

        hits.forEach((hit) => {
            if (!hit.location) return;
            const x = center + hit.location.x;
            const y = center + hit.location.y;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = hit.urgency === 'Critical' ? '#ef4444' : '#10b981';
            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
        });
    }, [radarRotation, hits]);

    return (
        <div className="h-full flex flex-col gap-6 select-none animate-fade-in no-select">
            
            {/* HUD Status Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex justify-between items-center shadow-2xl">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Dominance</span>
                        <span className="text-xl font-black text-white italic tracking-tighter">BETA_LINK_STABLE</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Neural Flow</span>
                        <span className="text-xl font-mono font-bold text-emerald-400">4.2 TB/s</span>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-red-950/20 border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active Offensive</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                
                {/* Left: Tactical Map (Col 8) */}
                <div className="lg:col-span-8 bg-black border border-slate-800 rounded-[40px] flex flex-col relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10 bg-slate-900/30">
                        <h3 className="text-xs font-black text-indigo-400 italic tracking-tighter uppercase">Strategic Theater Map</h3>
                        <div className="flex gap-4">
                            <span className="text-[10px] text-slate-500 font-mono">X_COORD: 42.1</span>
                            <span className="text-[10px] text-slate-500 font-mono">Y_COORD: 18.7</span>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <canvas ref={mapRef} width={800} height={500} className="w-full h-full object-cover opacity-60" />
                        
                        {/* Interactive Markers Mockup */}
                        <div className="absolute top-1/4 left-1/3 p-4 bg-slate-900/80 border border-indigo-500/50 rounded-2xl backdrop-blur-md animate-fade-in-up">
                            <h4 className="text-[10px] font-black text-white uppercase mb-1">Region_Alpha</h4>
                            <p className="text-[9px] text-emerald-400 font-mono">MARKET_SHARE: +14.2%</p>
                        </div>
                    </div>

                    {/* Scrolling Ticker (Internal) */}
                    <div className="h-10 bg-indigo-950/20 border-t border-white/5 flex items-center px-6 overflow-hidden">
                        <div className="flex gap-12 whitespace-nowrap animate-fade-in-right">
                            {messages.map((m, i) => (
                                <span key={i} className="text-[9px] font-mono text-slate-500 uppercase">{m.timestamp} // {m.text}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Radar & Intelligence (Col 4) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Radar Module */}
                    <div className="bg-slate-950 border border-indigo-500/20 rounded-[40px] p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl h-1/2">
                         <h3 className="absolute top-6 left-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">Aegis Radar</h3>
                         <canvas ref={radarRef} width={240} height={240} className="relative z-10" />
                         <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <i className="fa-solid fa-earth-americas text-[180px]"></i>
                         </div>
                    </div>

                    {/* Action Feed Module */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] flex-1 flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Intel Stream</h3>
                            <button className="text-[9px] font-black text-indigo-400 uppercase">Archive</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {events.map((ev, i) => (
                                <div key={ev.id} className="relative pl-4 border-l border-slate-800 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-0.5">{ev.type}</p>
                                    <p className="text-[11px] text-slate-300 leading-tight">{ev.summary}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
