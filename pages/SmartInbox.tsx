import React, { useState, useEffect } from 'react';
import { analyzeInboxMessage, generateSmartReplies } from '../services/geminiService';
import { MessageAnalysis } from '../types';

// Extended message type to handle Gmail
interface Message {
  id: number | string;
  user: string;
  handle: string;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'gmail';
  content: string;
  time: string;
  unread: boolean;
  subject?: string; // For emails
}

const MOCK_MESSAGES: Message[] = [
    { id: 1, user: "Sarah Jenkins", handle: "@sarah_j", platform: "twitter", content: "Love the new update! When is the dark mode coming to mobile?", time: "5m ago", unread: true },
    { id: 2, user: "TechDaily", handle: "@techdaily", platform: "instagram", content: "Great visuals on this post 🔥 Would love to collab. What are your rates?", time: "12m ago", unread: true },
    { id: 3, user: "John Doe", handle: "@johnd", platform: "linkedin", content: "This is exactly what our team needed. DMing you for enterprise pricing.", time: "1h ago", unread: false },
    { id: 4, user: "Emily R.", handle: "@emily_r", platform: "twitter", content: "Can you clarify the pricing model? I'm finding it a bit confusing.", time: "2h ago", unread: false },
];

const MOCK_EMAILS: Message[] = [
    { id: 'e1', user: "Substack", handle: "newsletter@substack.com", platform: "gmail", content: "Your weekly digest: AI is changing the landscape of social media...", subject: "Weekly AI Digest", time: "30m ago", unread: true },
    { id: 'e2', user: "Product Hunt", handle: "hello@producthunt.com", platform: "gmail", content: "Top products of the day: Elevate OS launched today!", subject: "Daily Top 10", time: "4h ago", unread: false },
];

type Tab = 'all' | 'mentions' | 'gmail';

export const SmartInbox: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const [isConnected, setIsConnected] = useState(false); // Simulates Gmail connection state
    const [selectedMessage, setSelectedMessage] = useState<Message>(MOCK_MESSAGES[0]);
    
    // AI State
    const [analysis, setAnalysis] = useState<MessageAnalysis | null>(null);
    const [smartReplies, setSmartReplies] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [replyText, setReplyText] = useState('');

    // Filter logic
    const displayedMessages = activeTab === 'gmail' 
        ? (isConnected ? MOCK_EMAILS : [])
        : activeTab === 'mentions' 
            ? MOCK_MESSAGES.filter(m => m.platform !== 'gmail')
            : [...MOCK_MESSAGES, ...(isConnected ? MOCK_EMAILS : [])].sort((a,b) => a.unread === b.unread ? 0 : a.unread ? -1 : 1);

    const handleConnectGmail = () => {
        setIsConnected(true);
    };

    // Reset AI state when selection changes
    useEffect(() => {
        setAnalysis(null);
        setSmartReplies([]);
        setReplyText('');
    }, [selectedMessage]);

    const handleAnalyze = async () => {
        if (!selectedMessage) return;
        setIsAnalyzing(true);
        
        // Run in parallel
        const [analysisResult, repliesResult] = await Promise.all([
            analyzeInboxMessage(selectedMessage.content),
            generateSmartReplies(selectedMessage.content, selectedMessage.user)
        ]);

        setAnalysis(analysisResult);
        setSmartReplies(repliesResult);
        setIsAnalyzing(false);
    };

    const handleApplyReply = (text: string) => {
        setReplyText(text);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Message List */}
            <div className="w-1/3 bg-surface rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Inbox</h3>
                        <div className="flex gap-2 text-xs">
                             <button className="text-muted hover:text-text"><i className="fa-solid fa-filter"></i></button>
                             <button className="text-muted hover:text-text"><i className="fa-solid fa-check-double"></i></button>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex bg-slate-900/50 p-1 rounded-lg">
                        {(['all', 'mentions', 'gmail'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                                    activeTab === tab 
                                    ? 'bg-surface text-white shadow-sm' 
                                    : 'text-muted hover:text-text'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'gmail' && !isConnected ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                                <i className="fa-brands fa-google text-red-500 text-xl"></i>
                            </div>
                            <h4 className="font-medium text-sm mb-1">Connect Gmail</h4>
                            <p className="text-xs text-muted mb-4">Sync newsletters and mentions directly to your inbox.</p>
                            <button 
                                onClick={handleConnectGmail}
                                className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Connect Account
                            </button>
                        </div>
                    ) : (
                        displayedMessages.map(msg => (
                            <div 
                                key={msg.id} 
                                onClick={() => setSelectedMessage(msg)}
                                className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                                    msg.unread ? 'bg-slate-700/20' : ''
                                } ${selectedMessage?.id === msg.id ? 'bg-slate-700/40 border-l-2 border-l-primary' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        {msg.platform === 'gmail' ? (
                                             <div className="w-5 h-5 rounded flex items-center justify-center bg-red-500/10 text-red-500 text-xs">
                                                 <i className="fa-regular fa-envelope"></i>
                                             </div>
                                        ) : (
                                            <i className={`fa-brands fa-${msg.platform} text-muted text-xs w-5 text-center`}></i>
                                        )}
                                        <span className="font-bold text-sm text-text truncate max-w-[120px]">{msg.user}</span>
                                    </div>
                                    <span className="text-xs text-muted whitespace-nowrap">{msg.time}</span>
                                </div>
                                {msg.subject && (
                                    <p className="text-xs font-semibold text-text mb-0.5 truncate pl-7">{msg.subject}</p>
                                )}
                                <p className="text-sm text-muted line-clamp-2 pl-7">{msg.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Message Detail / Reply Area */}
            <div className="flex-1 bg-surface rounded-xl border border-slate-700 flex flex-col relative overflow-hidden">
                {selectedMessage ? (
                    <>
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                                    selectedMessage.platform === 'gmail' ? 'bg-red-500 text-white' : 'bg-slate-600'
                                }`}>
                                    {selectedMessage.platform === 'gmail' ? (
                                        <i className="fa-brands fa-google"></i>
                                    ) : (
                                        <img src={`https://picsum.photos/seed/${selectedMessage.id}/50/50`} alt="Avatar" className="w-full h-full rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">{selectedMessage.user}</h2>
                                    <p className="text-sm text-muted">
                                        {selectedMessage.handle} • {selectedMessage.platform === 'gmail' ? 'Email' : 'Direct Message'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Actions / AI Trigger */}
                            <div className="flex items-center gap-3">
                                {!analysis ? (
                                    <button 
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                                    >
                                        {isAnalyzing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                        Analyze Context
                                    </button>
                                ) : (
                                    <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                                        <i className="fa-solid fa-check mr-1"></i> Analyzed
                                    </span>
                                )}
                                <div className="h-6 w-px bg-slate-700"></div>
                                <button className="p-2 text-muted hover:text-text rounded hover:bg-slate-700"><i className="fa-solid fa-box-archive"></i></button>
                                <button className="p-2 text-muted hover:text-text rounded hover:bg-slate-700"><i className="fa-solid fa-trash"></i></button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            
                            {/* AI Analysis Card */}
                            {analysis && (
                                <div className="mb-6 bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/20 rounded-xl p-4 animate-fade-in relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <i className="fa-solid fa-brain text-6xl"></i>
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">AI Insights</h4>
                                        <div className="flex flex-wrap gap-4 mb-3">
                                            <div className="flex items-center gap-2 text-sm bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                                                <i className={`fa-solid ${
                                                    analysis.sentiment === 'positive' ? 'fa-face-smile text-emerald-400' :
                                                    analysis.sentiment === 'negative' ? 'fa-face-frown text-red-400' :
                                                    'fa-face-meh text-amber-400'
                                                }`}></i>
                                                <span className="capitalize text-slate-200">{analysis.sentiment}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                                                <i className={`fa-solid fa-flag ${
                                                    analysis.priority === 'high' ? 'text-red-500' : 'text-slate-400'
                                                }`}></i>
                                                <span className="capitalize text-slate-200">{analysis.priority} Priority</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                                                <i className="fa-solid fa-tag text-indigo-400"></i>
                                                <span className="capitalize text-slate-200">{analysis.category}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-2 rounded">
                                            <span className="text-indigo-300 font-bold mr-1">Summary:</span>
                                            {analysis.summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedMessage.platform === 'gmail' && (
                                <div className="mb-4 pb-4 border-b border-slate-700">
                                    <h1 className="text-xl font-bold mb-2">{selectedMessage.subject}</h1>
                                    <div className="flex gap-2 text-xs text-muted mb-4">
                                        <span className="bg-slate-700 px-2 py-0.5 rounded">Inbox</span>
                                        <span className="bg-slate-700 px-2 py-0.5 rounded">Updates</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <div className="self-start bg-slate-700 rounded-lg rounded-tl-none p-4 max-w-[80%]">
                                    <p className="text-sm leading-relaxed">{selectedMessage.content}</p>
                                    {selectedMessage.platform === 'gmail' && (
                                        <p className="mt-4 text-sm leading-relaxed">
                                            (Mock Email Body: This would contain the full HTML content of the newsletter fetched from the Gmail API...)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                            
                            {/* Smart Reply Chips */}
                            {smartReplies.length > 0 && (
                                <div className="mb-3 overflow-x-auto pb-2">
                                    <div className="flex gap-2">
                                        <div className="flex items-center text-xs font-bold text-primary mr-2 whitespace-nowrap">
                                            <i className="fa-solid fa-bolt mr-1"></i> Quick Reply:
                                        </div>
                                        {smartReplies.map((reply, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleApplyReply(reply)}
                                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs text-slate-200 transition-colors hover:border-primary hover:text-white"
                                            >
                                                {reply.length > 40 ? reply.substring(0, 40) + '...' : reply}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 transition-colors focus-within:border-primary/50">
                                <textarea 
                                    className="w-full bg-transparent text-sm p-2 outline-none resize-none h-24 text-slate-200 placeholder-slate-500"
                                    placeholder={`Reply to ${selectedMessage.user}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center px-2 pb-1">
                                    <div className="flex gap-3 text-muted">
                                        <button onClick={handleAnalyze} className="hover:text-primary transition-colors" title="Refresh AI">
                                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                                        </button>
                                        <button className="hover:text-text transition-colors">
                                            <i className="fa-regular fa-image"></i>
                                        </button>
                                    </div>
                                    <button className="bg-primary hover:bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-lg">
                                        Send Reply <i className="fa-regular fa-paper-plane ml-1"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted">
                         <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <i className="fa-regular fa-comments text-3xl text-slate-600"></i>
                        </div>
                        <p>Select a message to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};