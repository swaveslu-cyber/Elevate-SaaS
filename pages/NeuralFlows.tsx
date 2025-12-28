
import React, { useState, useEffect, useRef } from 'react';
import { constructAgent } from '../services/geminiService';
import { AgentFlow } from '../types';

interface NodePosition {
    id: string;
    x: number;
    y: number;
    type: 'trigger' | 'processor' | 'action';
    label: string;
    icon: string;
    status: 'idle' | 'active' | 'complete' | 'error';
}

interface Connection {
    from: string;
    to: string;
}

export const NeuralFlows: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const initialNodes: NodePosition[] = [
          { id: 'n1', x: 80, y: 150, type: 'trigger', label: 'Market Pulse', icon: 'fa-eye', status: 'idle' },
          { id: 'n2', x: 380, y: 150, type: 'processor', label: 'Sentiment Logic', icon: 'fa-brain', status: 'idle' },
          { id: 'n3', x: 680, y: 150, type: 'action', label: 'Broadcast Pivot', icon: 'fa-tower-broadcast', status: 'idle' },
      ];
      setNodes(initialNodes);
      setConnections([{ from: 'n1', to: 'n2' }, { from: 'n2', to: 'n3' }]);
  }, []);

  useEffect(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleBuild = async () => {
      if (!prompt) return;
      setIsBuilding(true);
      setLogs(prev => [...prev, `> COMPILING_BLUEPRINT: "${prompt}"...`]);
      const agent = await constructAgent(prompt);
      if (agent) {
          const newNodes: NodePosition[] = [];
          const newConns: Connection[] = [];
          let x = 80;
          newNodes.push({ id: 'n-trigger', x, y: 150, type: 'trigger', label: agent.trigger, icon: 'fa-bolt', status: 'idle' });
          x += 300;
          agent.steps.forEach((step, i) => {
              const id = `n-${i}`;
              newNodes.push({ id, x, y: 150, type: i === agent.steps.length - 1 ? 'action' : 'processor', label: step, icon: i === agent.steps.length - 1 ? 'fa-paper-plane' : 'fa-microchip', status: 'idle' });
              newConns.push({ from: i === 0 ? 'n-trigger' : `n-${i-1}`, to: id });
              x += 300;
          });
          setNodes(newNodes);
          setConnections(newConns);
          setLogs(prev => [...prev, `> CIRCUIT_STABLE: ${newNodes.length} Nodes Online.`]);
          setPrompt('');
      }
      setIsBuilding(false);
  };

  const handleRun = async () => {
      if (isRunning || nodes.length === 0) return;
      setIsRunning(true);
      setLogs(prev => [...prev, `> INITIALIZING_CORE_SEQUENCE...`]);
      setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
      for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'active' } : n));
          setLogs(prev => [...prev, `> NODE_EXECUTION: ${node.label}`]);
          await new Promise(r => setTimeout(r, 1200));
          setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'complete' } : n));
      }
      setLogs(prev => [...prev, `> SEQUENCE_SUCCESS: LOG_EXFILTRATED.`]);
      setIsRunning(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-lg">
                    <i className="fa-solid fa-network-wired text-xl"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Circuit Architect</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural Automation Core</p>
                </div>
            </div>
            <div className="flex-1 w-full max-w-2xl flex gap-2 relative z-10">
                <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter Logic Command..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-xs font-mono text-indigo-400 focus:border-indigo-500 outline-none shadow-inner"
                />
                <button onClick={handleBuild} disabled={isBuilding} className="px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-[10px] transition-all uppercase tracking-widest border border-slate-700">{isBuilding ? 'BUILDING' : 'BUILD'}</button>
                <button onClick={handleRun} disabled={isRunning} className="px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] shadow-2xl transition-all uppercase tracking-widest">{isRunning ? 'ACTIVE' : 'RUN'}</button>
            </div>
       </div>

       <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            <div className="flex-1 bg-[#05070a] rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl group">
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {connections.map((conn, i) => {
                        const from = nodes.find(n => n.id === conn.from);
                        const to = nodes.find(n => n.id === conn.to);
                        if (!from || !to) return null;
                        const sx = from.x + 96, sy = from.y + 40, ex = to.x + 96, ey = to.y + 40;
                        const dx = ex - sx;
                        return (
                            <g key={i}>
                                <path d={`M ${sx} ${sy} C ${sx + dx * 0.5} ${sy}, ${ex - dx * 0.5} ${ey}, ${ex} ${ey}`} fill="none" stroke="#1e293b" strokeWidth="4" />
                                <path d={`M ${sx} ${sy} C ${sx + dx * 0.5} ${sy}, ${ex - dx * 0.5} ${ey}, ${ex} ${ey}`} fill="none" stroke={from.status === 'complete' ? "#6366f1" : "#334155"} strokeWidth="2" className="transition-all duration-500" />
                                {(from.status === 'active' || (from.status === 'complete' && to.status === 'active')) && (
                                    <circle r="4" fill="#6366f1" className="shadow-[0_0_10px_#6366f1]">
                                        <animateMotion dur="1.2s" repeatCount="indefinite" path={`M ${sx} ${sy} C ${sx + dx * 0.5} ${sy}, ${ex - dx * 0.5} ${ey}, ${ex} ${ey}`} />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                </svg>
                <div className="relative w-full h-full z-10 p-10 overflow-auto custom-scrollbar">
                    {nodes.map((node) => (
                        <div key={node.id} className={`absolute w-56 p-5 rounded-2xl border-2 transition-all duration-500 flex flex-col gap-3 shadow-2xl backdrop-blur-md ${node.status === 'active' ? 'bg-indigo-950/80 border-indigo-400 scale-105 shadow-indigo-500/20' : node.status === 'complete' ? 'bg-slate-900 border-indigo-900 opacity-80' : 'bg-slate-950 border-slate-800'}`} style={{ left: node.x, top: node.y }}>
                            <div className="flex items-center justify-between">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${node.status === 'active' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}><i className={`fa-solid ${node.icon}`}></i></div>
                                {node.status === 'active' && <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>}
                            </div>
                            <div>
                                <span className="text-[9px] font-black uppercase text-slate-500 block mb-1 tracking-widest">{node.type}</span>
                                <h4 className={`text-xs font-black tracking-tight leading-tight ${node.status === 'active' ? 'text-white italic' : 'text-slate-300'}`}>{node.label}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-full lg:w-96 bg-black rounded-3xl border border-slate-800 font-mono text-[11px] p-6 flex flex-col shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <span className="text-indigo-500 font-black tracking-widest uppercase italic">Console Log</span>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 text-slate-400 custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className="animate-fade-in flex gap-3">
                            <span className="text-slate-700 shrink-0">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                            <span className={log.includes('SUCCESS') ? 'text-emerald-500' : log.includes('NODE') ? 'text-indigo-300' : 'text-slate-300'}>{log}</span>
                        </div>
                    ))}
                    <div ref={logEndRef}></div>
                </div>
            </div>
       </div>
    </div>
  );
};
