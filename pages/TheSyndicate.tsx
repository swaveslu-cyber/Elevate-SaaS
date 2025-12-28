import React, { useState } from 'react';
import { optimizeSyndicateBoard, executeSyndicateTask } from '../services/geminiService';
import { SyndicateBoard, TaskCard } from '../types';

const INITIAL_BOARD: SyndicateBoard = {
    columns: [
        {
            id: 'col1',
            title: 'To Do',
            cards: [
                { id: 't1', title: 'Draft Launch Email', priority: 'High', assigneeId: 'ai1', tags: ['Copy', 'Launch'] },
                { id: 't2', title: 'Competitor Analysis', priority: 'Low', assigneeId: 'h1', tags: ['Strategy'] }
            ]
        },
        {
            id: 'col2',
            title: 'In Progress',
            cards: [
                { id: 't3', title: 'Video Editing', priority: 'Medium', assigneeId: 'ai2', tags: ['Video'] }
            ]
        },
        {
            id: 'col3',
            title: 'Review',
            cards: []
        },
        {
            id: 'col4',
            title: 'Done',
            cards: [
                { id: 't4', title: 'Q3 Report', priority: 'High', assigneeId: 'h1', tags: ['Ops'] }
            ]
        }
    ],
    members: [
        { id: 'h1', name: 'Alex (You)', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Alex&background=6366f1&color=fff', isAi: false, status: 'online' },
        { id: 'ai1', name: 'Scribe AI', role: 'Copywriter', avatar: '', isAi: true, status: 'online' },
        { id: 'ai2', name: 'Director AI', role: 'Video Editor', avatar: '', isAi: true, status: 'busy' }
    ]
};

export const TheSyndicate: React.FC = () => {
  const [board, setBoard] = useState<SyndicateBoard>(INITIAL_BOARD);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleOptimize = async () => {
      setIsOptimizing(true);
      const newBoard = await optimizeSyndicateBoard(board);
      if (newBoard) {
          setBoard(newBoard);
      }
      setIsOptimizing(false);
  };

  const handleExecuteTask = async () => {
      if (!selectedTask) return;
      setIsExecuting(true);
      
      const result = await executeSyndicateTask(selectedTask.title, selectedTask.tags);
      
      if (result) {
          const updatedCard = { ...selectedTask, output: result.output, outputType: result.type };
          
          // Update Board State
          const updatedColumns = board.columns.map(col => ({
              ...col,
              cards: col.cards.map(card => card.id === selectedTask.id ? updatedCard : card)
          }));
          
          setBoard({ ...board, columns: updatedColumns });
          setSelectedTask(updatedCard);
      }
      setIsExecuting(false);
  };

  const getPriorityColor = (p: string) => {
      if (p === 'High') return 'bg-red-500/20 text-red-400 border-red-500/30';
      if (p === 'Medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  const getMember = (id: string) => board.members.find(m => m.id === id);

  return (
    <div className="h-full flex flex-col gap-6 relative">
       
       {/* Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-users-viewfinder text-blue-400"></i> The Syndicate
                </h2>
                <p className="text-sm text-muted">Collaborative Command Center</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    {board.members.map(m => (
                        <div key={m.id} className="relative group cursor-pointer">
                            {m.isAi ? (
                                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-surface flex items-center justify-center text-xs text-white font-bold">AI</div>
                            ) : (
                                <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border-2 border-surface" />
                            )}
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${m.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        </div>
                    ))}
                    <button className="w-8 h-8 rounded-full bg-slate-800 border-2 border-surface flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                </div>
                
                <div className="h-8 w-px bg-slate-700"></div>

                <button 
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isOptimizing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    Auto-Assign
                </button>
            </div>
       </div>

       {/* Kanban Board */}
       <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 h-full min-w-max px-2">
                {board.columns.map(col => (
                    <div key={col.id} className="w-72 bg-slate-900/50 border border-slate-700 rounded-xl flex flex-col">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-200 text-sm">{col.title}</h3>
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400 font-mono">{col.cards.length}</span>
                        </div>
                        
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                            {col.cards.map(card => {
                                const assignee = getMember(card.assigneeId);
                                return (
                                    <div 
                                        key={card.id} 
                                        onClick={() => setSelectedTask(card)}
                                        className="bg-surface p-4 rounded-lg border border-slate-700 shadow-sm hover:border-blue-500/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(card.priority)}`}>
                                                {card.priority}
                                            </span>
                                            {card.output && <i className="fa-solid fa-check-circle text-emerald-500"></i>}
                                        </div>
                                        <h4 className="text-sm font-medium text-white mb-3">{card.title}</h4>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                {assignee?.isAi ? (
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 border border-indigo-500/30" title={assignee.role}>AI</div>
                                                ) : (
                                                    <img src={assignee?.avatar} alt="Assignee" className="w-6 h-6 rounded-full" title={assignee?.name} />
                                                )}
                                                <span className="text-xs text-slate-400 truncate max-w-[80px]">{assignee?.name.split(' ')[0]}</span>
                                            </div>
                                            {card.tags.length > 0 && (
                                                <div className="flex gap-1">
                                                    {card.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="w-2 h-2 rounded-full bg-slate-600" title={tag}></span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <button className="w-full py-2 border-2 border-dashed border-slate-800 text-slate-500 rounded-lg hover:border-slate-600 hover:text-slate-300 transition-colors text-sm font-bold">
                                + Add Task
                            </button>
                        </div>
                    </div>
                ))}
            </div>
       </div>

       {/* Task Detail Modal */}
       {selectedTask && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTask(null)}>
               <div className="bg-surface border border-slate-600 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                   <div className="flex justify-between items-start mb-6">
                       <div>
                           <div className="flex items-center gap-3 mb-2">
                               <h2 className="text-xl font-bold text-white">{selectedTask.title}</h2>
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(selectedTask.priority)}`}>
                                   {selectedTask.priority}
                               </span>
                           </div>
                           <div className="flex gap-2">
                               {selectedTask.tags.map(tag => (
                                   <span key={tag} className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">#{tag}</span>
                               ))}
                           </div>
                       </div>
                       <button onClick={() => setSelectedTask(null)} className="text-muted hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                   </div>

                   <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-xl border border-slate-700 p-6 mb-6">
                       {!selectedTask.output ? (
                           <div className="h-full flex flex-col items-center justify-center text-muted opacity-60">
                               <i className="fa-solid fa-list-check text-4xl mb-3"></i>
                               <p className="text-sm">No content generated yet.</p>
                           </div>
                       ) : (
                           <div className="space-y-4">
                               <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2">
                                   <i className="fa-solid fa-robot"></i> Agent Output
                               </div>
                               {selectedTask.outputType === 'image' ? (
                                   <img src={selectedTask.output} alt="Generated" className="w-full rounded-lg border border-slate-600" />
                               ) : (
                                   <div className="prose prose-invert prose-sm max-w-none text-slate-200 whitespace-pre-wrap font-medium">
                                       {selectedTask.output}
                                   </div>
                               )}
                           </div>
                       )}
                   </div>

                   <div className="flex justify-end gap-3">
                       {!selectedTask.output && (
                           <button 
                               onClick={handleExecuteTask}
                               disabled={isExecuting}
                               className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 disabled:opacity-50"
                           >
                               {isExecuting ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Processing...</> : <><i className="fa-solid fa-bolt"></i> Auto-Complete Task</>}
                           </button>
                       )}
                       {selectedTask.output && (
                           <button className="px-4 py-2 border border-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">
                               Download / Export
                           </button>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};