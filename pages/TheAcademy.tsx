import React, { useState } from 'react';
import { generateCourseCurriculum, generateLessonContent } from '../services/geminiService';
import { AcademyCourse, CourseLesson, CourseModule } from '../types';

export const TheAcademy: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [moduleCount, setModuleCount] = useState(4);
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [course, setCourse] = useState<AcademyCourse | null>(null);
  
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [lessonContent, setLessonContent] = useState<{script: string, assignment: string} | null>(null);

  const handleArchitect = async () => {
      if (!topic) return;
      setIsArchitecting(true);
      setCourse(null);
      setSelectedLesson(null);
      setLessonContent(null);
      
      const result = await generateCourseCurriculum(topic, level, moduleCount);
      setCourse(result);
      setIsArchitecting(false);
  };

  const handleSelectLesson = (lesson: CourseLesson) => {
      setSelectedLesson(lesson);
      setLessonContent(null); 
      // If we cached content in the lesson object itself in a real app, we'd check here.
  };

  const handleGenerateContent = async () => {
      if (!selectedLesson || !course) return;
      setIsGeneratingContent(true);
      const result = await generateLessonContent(selectedLesson.title, `Course: ${course.title}. Audience: ${course.targetAudience}`);
      setLessonContent(result);
      setIsGeneratingContent(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
       {/* Config Header */}
       <div className="bg-surface rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row gap-6 items-end relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 to-cyan-900/20 pointer-events-none"></div>
            
            <div className="flex-1 w-full space-y-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded bg-teal-600 flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">The Academy</h2>
                        <p className="text-sm text-muted">Architect high-value digital courses.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Course Topic</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. 'Advanced React Patterns'"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-teal-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Target Level</label>
                        <select 
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:border-teal-500 outline-none"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Expert</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted uppercase mb-1">Modules: {moduleCount}</label>
                        <input 
                            type="range" 
                            min="3" max="10" 
                            value={moduleCount}
                            onChange={(e) => setModuleCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleArchitect}
                disabled={isArchitecting || !topic}
                className="w-full md:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 relative z-10"
            >
                {isArchitecting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Architect Course'}
            </button>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            
            {/* Left: Curriculum View */}
            <div className="lg:w-1/3 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden">
                {!course ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-40 p-6 text-center">
                        <i className="fa-solid fa-layer-group text-6xl mb-4"></i>
                        <p>Define your topic to generate a syllabus.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                            <h3 className="font-bold text-white text-lg leading-tight">{course.title}</h3>
                            <p className="text-xs text-teal-400 mt-1 uppercase tracking-wider font-bold">{course.targetAudience}</p>
                            <p className="text-sm text-slate-400 mt-2">{course.description}</p>
                        </div>
                        <div className="p-4 space-y-4">
                            {course.modules.map((mod, i) => (
                                <div key={i} className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
                                    <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
                                        <h4 className="font-bold text-sm text-slate-200">Module {i+1}: {mod.title}</h4>
                                    </div>
                                    <div className="divide-y divide-slate-700/50">
                                        {mod.lessons.map((lesson, j) => (
                                            <button 
                                                key={j}
                                                onClick={() => handleSelectLesson(lesson)}
                                                className={`w-full text-left p-3 text-sm flex justify-between items-center hover:bg-slate-700/50 transition-colors ${
                                                    selectedLesson === lesson ? 'bg-teal-900/20 text-teal-300' : 'text-slate-400'
                                                }`}
                                            >
                                                <span>{lesson.title}</span>
                                                <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-500 font-mono">{lesson.duration}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Lesson Detail */}
            <div className="flex-1 bg-surface border border-slate-700 rounded-xl flex flex-col overflow-hidden relative">
                {!selectedLesson ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-30">
                        <i className="fa-solid fa-chalkboard-user text-8xl mb-6"></i>
                        <p className="text-xl font-light">Select a lesson to develop content.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedLesson.title}</h3>
                                <p className="text-sm text-slate-400">Duration: {selectedLesson.duration}</p>
                            </div>
                            {!lessonContent && (
                                <button 
                                    onClick={handleGenerateContent}
                                    disabled={isGeneratingContent}
                                    className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                                >
                                    {isGeneratingContent ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Generate Material'}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {isGeneratingContent ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="w-16 h-16 border-4 border-slate-800 border-t-teal-500 rounded-full animate-spin"></div>
                                    <p className="text-slate-400 animate-pulse">Drafting lesson script & assignment...</p>
                                </div>
                            ) : lessonContent ? (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="prose prose-invert max-w-none">
                                        <h4 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4 border-b border-teal-500/20 pb-2">Teaching Script</h4>
                                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-serif text-lg">
                                            {lessonContent.script}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
                                        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-list-check text-teal-500"></i> Practical Assignment
                                        </h4>
                                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {lessonContent.assignment}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted">
                                    <p>Ready to generate content for this lesson.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};