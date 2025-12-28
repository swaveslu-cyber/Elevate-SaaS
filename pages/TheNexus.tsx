import React, { useState, useEffect, useRef } from 'react';
import { generateNexusGraph } from '../services/geminiService';
import { NexusGraph, NexusNode, NexusEdge } from '../types';

export const TheNexus: React.FC = () => {
  const [graph, setGraph] = useState<NexusGraph | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<NexusEdge | null>(null);
  
  // Canvas State for rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NexusNode[]>([]);
  const [edges, setEdges] = useState<NexusEdge[]>([]);
  const animationRef = useRef<number>(0);

  // Load initial data from other modules or use mock seed
  useEffect(() => {
      const loadGraph = async () => {
          setIsGenerating(true);
          
          // Gather entities from other modules (simulated local storage access)
          const partners = JSON.parse(localStorage.getItem('elevate_partners') || '[]');
          const competitors = []; // Mock if empty
          if (competitors.length === 0) {
              competitors.push({ name: 'CompetitorX', type: 'competitor' });
              competitors.push({ name: 'OldGuard Inc', type: 'competitor' });
          }
          const personas = JSON.parse(localStorage.getItem('elevate_personas') || '[]');
          if (personas.length === 0) {
              personas.push({ name: 'Gen Z Gamers', type: 'persona' });
          }

          // Combine for API
          const entities = [
              { name: 'My Brand', type: 'brand' },
              ...partners.map((p: any) => ({ name: p.name, type: 'partner' })).slice(0,3),
              ...competitors.map((c: any) => ({ name: c.name, type: 'competitor' })),
              ...personas.map((p: any) => ({ name: p.name, type: 'persona' })).slice(0,3)
          ];

          const data = await generateNexusGraph(entities);
          if (data) {
              // Initialize positions randomly in a circle
              const width = containerRef.current?.clientWidth || 800;
              const height = containerRef.current?.clientHeight || 600;
              const initializedNodes = data.nodes.map((n, i) => ({
                  ...n,
                  x: width/2 + Math.cos(i * 2 * Math.PI / data.nodes.length) * 200,
                  y: height/2 + Math.sin(i * 2 * Math.PI / data.nodes.length) * 200,
                  vx: 0,
                  vy: 0
              }));
              
              setNodes(initializedNodes);
              setEdges(data.edges);
              setGraph(data);
          }
          setIsGenerating(false);
      };
      
      loadGraph();
  }, []);

  // Simple Force Simulation Loop
  useEffect(() => {
      if (nodes.length === 0) return;

      const animate = () => {
          const width = containerRef.current?.clientWidth || 800;
          const height = containerRef.current?.clientHeight || 600;
          const center = { x: width/2, y: height/2 };

          setNodes(prevNodes => {
              return prevNodes.map(node => {
                  let fx = 0, fy = 0;

                  // 1. Repulsion (Nodes push apart)
                  prevNodes.forEach(other => {
                      if (node.id === other.id) return;
                      const dx = node.x - other.x;
                      const dy = node.y - other.y;
                      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                      const force = 1000 / (dist * dist);
                      fx += (dx / dist) * force;
                      fy += (dy / dist) * force;
                  });

                  // 2. Attraction (Edges pull together)
                  edges.forEach(edge => {
                      if (edge.source === node.id || edge.target === node.id) {
                          const otherId = edge.source === node.id ? edge.target : edge.source;
                          const other = prevNodes.find(n => n.id === otherId);
                          if (other) {
                              const dx = other.x - node.x;
                              const dy = other.y - node.y;
                              const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                              const force = dist * 0.005; // Spring constant
                              fx += (dx / dist) * force;
                              fy += (dy / dist) * force;
                          }
                      }
                  });

                  // 3. Center Gravity
                  const dx = center.x - node.x;
                  const dy = center.y - node.y;
                  fx += dx * 0.001;
                  fy += dy * 0.001;

                  // Apply velocity
                  // Simple damping
                  return {
                      ...node,
                      x: node.x + fx,
                      y: node.y + fy
                  };
              });
          });

          animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
  }, [edges]); // Re-bind if edges change, nodes update internally in state setter

  // Canvas Rendering
  useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Resize
      canvas.width = containerRef.current?.clientWidth || 800;
      canvas.height = containerRef.current?.clientHeight || 600;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Edges
      edges.forEach(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (source && target) {
              ctx.beginPath();
              ctx.moveTo(source.x, source.y);
              ctx.lineTo(target.x, target.y);
              ctx.strokeStyle = edge.type === 'positive' ? '#10b981' : edge.type === 'negative' ? '#ef4444' : '#64748b';
              ctx.lineWidth = 1 + (selectedEdge === edge ? 2 : 0);
              ctx.globalAlpha = 0.4;
              ctx.stroke();
              ctx.globalAlpha = 1;
          }
      });

      // Draw Nodes
      nodes.forEach(node => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8 + (node.val || 0), 0, 2 * Math.PI);
          ctx.fillStyle = node.type === 'brand' ? '#6366f1' : node.type === 'competitor' ? '#ef4444' : node.type === 'partner' ? '#10b981' : '#eab308';
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, 12 + (node.val || 0), 0, 2 * Math.PI);
          ctx.strokeStyle = '#1e293b';
          ctx.stroke();

          // Label
          ctx.font = '10px Inter';
          ctx.fillStyle = '#cbd5e1';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + 25);
      });

  }, [nodes, edges, selectedEdge]);

  const handleCanvasClick = (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check for edge click (simplified hit detection)
      const clickedEdge = edges.find(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return false;
          
          // Distance from point to line segment
          const A = x - source.x;
          const B = y - source.y;
          const C = target.x - source.x;
          const D = target.y - source.y;
          const dot = A * C + B * D;
          const len_sq = C * C + D * D;
          const param = len_sq !== 0 ? dot / len_sq : -1;
          
          let xx, yy;
          if (param < 0) { xx = source.x; yy = source.y; }
          else if (param > 1) { xx = target.x; yy = target.y; }
          else { xx = source.x + param * C; yy = source.y + param * D; }
          
          const dx = x - xx;
          const dy = y - yy;
          return (dx * dx + dy * dy) < 100; // 10px radius
      });

      if (clickedEdge) {
          setSelectedEdge(clickedEdge);
      } else {
          setSelectedEdge(null);
      }
  };

  return (
    <div className="h-full flex flex-col gap-6">
       
       <div className="bg-surface rounded-xl border border-slate-700 flex-1 relative overflow-hidden flex flex-col md:flex-row">
            {/* Graph Area */}
            <div ref={containerRef} className="flex-1 relative bg-slate-950">
                <canvas 
                    ref={canvasRef} 
                    onClick={handleCanvasClick}
                    className="absolute inset-0 cursor-pointer"
                />
                
                <div className="absolute top-4 left-4 pointer-events-none">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <i className="fa-solid fa-circle-nodes text-indigo-500"></i> The Nexus
                    </h2>
                    <p className="text-sm text-slate-400">Strategic Relationship Graph</p>
                </div>

                {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center gap-3">
                            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500"></i>
                            <p className="text-indigo-200 text-sm font-bold">Constructing Neural Graph...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar / Details Panel */}
            <div className={`w-80 bg-slate-900 border-l border-slate-700 p-6 flex flex-col transition-all duration-300 ${selectedEdge ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                {selectedEdge ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <i className="fa-solid fa-link"></i> Connection Analysis
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{selectedEdge.relationship}</h3>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-4 ${
                            selectedEdge.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                            selectedEdge.type === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                            {selectedEdge.type.toUpperCase()} Impact
                        </div>
                        
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6">
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {selectedEdge.description}
                            </p>
                        </div>

                        <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg">
                            Exploit This Connection
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted opacity-60">
                        <i className="fa-solid fa-diagram-project text-4xl mb-4"></i>
                        <p className="text-sm">Select a connection line to reveal strategic insights.</p>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};
