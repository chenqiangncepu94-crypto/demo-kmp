
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { DiagramGenerator } from './components/DiagramGenerator';
import { CodeViewer } from './components/CodeViewer';
import { Playground } from './components/Playground';
import { LESSONS } from './constants';
import { Lesson } from './types';

const App: React.FC = () => {
    const [currentLesson, setCurrentLesson] = useState<Lesson>(LESSONS[0]);
    // Store saved diagrams by lesson ID to persist them during session
    const [savedDiagrams, setSavedDiagrams] = useState<Record<string, string>>({});

    const handleSaveDiagram = (lessonId: string, imageUrl: string) => {
        setSavedDiagrams(prev => ({
            ...prev,
            [lessonId]: imageUrl
        }));
    };

    // Helper to render simple markdown-like text
    const renderContent = (text: string) => {
        const parts = text.split('###');
        return parts.map((part, index) => {
            if (!part.trim()) return null;
            const [title, ...body] = part.split('\n');
            return (
                <div key={index} className="mb-8">
                    {title && <h2 className="text-2xl font-bold text-gray-100 mb-4">{title.trim()}</h2>}
                    <div className="text-gray-300 leading-relaxed space-y-4 whitespace-pre-line">
                        {body.join('\n').trim()}
                    </div>
                </div>
            );
        });
    };

    const isPlaygroundLesson = currentLesson.id === 'lesson_7_playground';

    return (
        <div className="flex h-screen bg-gray-900 font-sans">
            <Sidebar 
                currentLessonId={currentLesson.id} 
                onSelectLesson={setCurrentLesson} 
            />

            <main className="flex-1 overflow-y-auto relative">
                <div className="max-w-4xl mx-auto p-8 pb-32">
                    {/* Header */}
                    <header className="mb-10 border-b border-gray-800 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-mono rounded border border-indigo-800">
                                UNIT {LESSONS.findIndex(l => l.id === currentLesson.id) + 1}
                            </span>
                            <span className="text-gray-500 text-xs font-mono uppercase tracking-wider">
                                KMP & WASM PIPELINE
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mt-2">
                            {currentLesson.title}
                        </h1>
                        <p className="text-xl text-gray-400 mt-3">
                            {currentLesson.description}
                        </p>
                    </header>

                    {/* Main Lesson Content */}
                    <article className="prose prose-invert max-w-none">
                        {renderContent(currentLesson.content)}
                    </article>

                    {/* Conditional Rendering: Playground vs Standard Code/Diagram */}
                    {isPlaygroundLesson ? (
                        <Playground />
                    ) : (
                        <>
                            {/* Code Example Block */}
                            {currentLesson.codeExample && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        核心代码示范
                                    </h3>
                                    <CodeViewer code={currentLesson.codeExample} />
                                </div>
                            )}

                            {/* AI Diagram Generator */}
                            <DiagramGenerator 
                                key={currentLesson.id} // Force reset internal state on lesson change
                                lessonId={currentLesson.id}
                                lessonPrompt={currentLesson.diagramPrompt} 
                                lessonTitle={currentLesson.title}
                                savedImageUrl={savedDiagrams[currentLesson.id]}
                                onSave={(url) => handleSaveDiagram(currentLesson.id, url)}
                            />
                        </>
                    )}
                    
                    {/* Navigation Footer */}
                    <div className="mt-16 flex justify-between border-t border-gray-800 pt-8">
                         {/* Simple previous/next logic */}
                        <button 
                            disabled={LESSONS[0].id === currentLesson.id}
                            onClick={() => {
                                const idx = LESSONS.findIndex(l => l.id === currentLesson.id);
                                if (idx > 0) setCurrentLesson(LESSONS[idx - 1]);
                            }}
                            className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous Lesson
                        </button>

                        <button 
                            disabled={LESSONS[LESSONS.length - 1].id === currentLesson.id}
                            onClick={() => {
                                const idx = LESSONS.findIndex(l => l.id === currentLesson.id);
                                if (idx < LESSONS.length - 1) setCurrentLesson(LESSONS[idx + 1]);
                            }}
                             className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold disabled:opacity-30 transition-colors"
                        >
                            Next Lesson
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </main>

            <ChatInterface />
        </div>
    );
};

export default App;
