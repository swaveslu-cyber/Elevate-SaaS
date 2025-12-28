import React, { useState, useEffect, useRef } from 'react';
import { scanSentinel } from '../services/geminiService';
import { SentinelHit } from '../types';

export const TheSentinel: React.FC = () => {
  const [hits, setHits] = useState<SentinelHit[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedHit, setSelectedHit] = useState<SentinelHit | null>(null);
  const [radarRotation, setRadarRotation] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initial Scan
  useEffect(() => {
    const startScan = async () => {
        setIsScanning(true);
        const data = await scanSentinel("Tech & SaaS Trends");
        setHits(data);
        setIsScanning(false);
    };
    startScan();

    // Radar Animation
    const interval = setInterval(() => {
        setRadarRotation(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Draw Radar
  useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const size = canvas.width;
      const center = size / 2;

      ctx.clearRect(0, 0, size, size);

      // Draw Rings
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 1;
      for (let r = 1; r <= 3; r++) {
          ctx.beginPath();
          ctx.arc(center, center, (size / 6) * r, 0, Math.PI * 2);
          ctx.stroke();
      }

      // Draw Axis
      ctx.beginPath();
      ctx.moveTo(0, center); ctx.lineTo(size, center);
      ctx.moveTo(center, 0); ctx.lineTo(center, size);
      ctx.stroke();

      // Draw Sweep
      const sweepGradient = ctx.createRadialGradient(center, center, 0, center, center, center);
      sweepGradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
      sweepGradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
      
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((radarRotation * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, center, -0.2, 0);
      ctx.lineTo(0, 0);
      ctx.fillStyle = sweepGradient;
      ctx.fill();
      ctx.restore();

      // Draw Blips (Hits)
      hits.forEach(hit => {
          if (!hit.location) return;
          const x = center + hit.location.x;
          const y = center + hit.location.y;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = hit.urgency === 'Critical' ? '#ef4444' : hit.urgency === 'High' ? '#f59e0b' : '#3b82f6';
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle as string;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Pulse if selected
          if (selectedHit?.id === hit.id) {
              ctx.beginPath();
              ctx.arc(x, y, 10, 0, Math.PI * 2);
              ctx.strokeStyle = ctx.fillStyle;
              ctx.lineWidth = 2;
              ctx.stroke();
          }
      });

  }, [radarRotation, hits, selectedHit]);

  const handleScan = async () => {
      setIsScanning(true);
      const data = await scanSentinel("Competitive Landscape and Emerging Patterns");
      setHits(prev => [...data, ...prev].slice(0, 10));
      setIsScanning(false);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
        
        {/* Left: Radar Control */}
        <div className="lg:w-1/2 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-6 left-6 z-10">
                <h2 className="text-2xl font-black text-red-500 italic tracking-tighter flex items-center gap-3">
                    <i className="fa-solid fa-crosshairs animate-pulse"></i> THE SENTINEL
                </h2>
                <p className="text-[10px] text-red-400 font-mono uppercase tracking-widest mt-1">Autonomous Threat & Opportunity Detection</p>
            </div>

            <div className="absolute bottom-6 left-6 z-10">
                <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg shadow-red-900/40 transition-all flex items-center gap-2"
                >
                    {isScanning ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-radar"></i>}
                    Forced Sweep
                </button>
            </div>

            <div className="relative">
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={400} 
                    className="relative z-0"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full border border-red-500/20 flex items-center justify-center">
                        <i className="fa-solid fa-shield-halved text-red-500/30 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* Live Feed Stat */}
            <div className="absolute top-6 right-6 text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Neural Processing</div>
                <div className="text-xl font-mono text-white">4.2 T/OPS</div>
            </div>
        </div>

        {/* Right: Intelligence Feed */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="bg-surface rounded-xl border border-slate-700 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-white">Tactical Feed</h3>
                    <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">{hits.length} Target(s)</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/30">
                    {hits.map((hit) => (
                        <div 
                            key={hit.id}
                            onClick={() => setSelectedHit(hit)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                                selectedHit?.id === hit.id 
                                ? 'bg-red-950/20 border-red-500 shadow-lg' 
                                : 'bg-surface border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                        hit.urgency === 'Critical' ? 'bg-red-500 animate-pulse' : 
                                        hit.urgency === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hit.type}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-600">{hit.timestamp}</span>
                            </div>
                            <h4 className="font-bold text-white text-sm mb-1">{hit.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2">{hit.description}</p>
                            
                            {selectedHit?.id === hit.id && (
                                <div className="mt-4 pt-4 border-t border-red-500/20 animate-fade-in">
                                    <h5 className="text-[10px] font-bold text-red-400 uppercase mb-2">Analysis Context</h5>
                                    <p className="text-xs text-slate-300 leading-relaxed italic mb-4">"{hit.context}"</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-red-600 text-white py-2 rounded text-[10px] font-bold">Counter Post</button>
                                        <button className="flex-1 bg-slate-700 text-white py-2 rounded text-[10px] font-bold">Dismiss</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
