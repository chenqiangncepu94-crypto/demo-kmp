import React from 'react';
import { LESSONS } from '../constants';
import { Lesson } from '../types';

interface SidebarProps {
    currentLessonId: string;
    onSelectLesson: (lesson: Lesson) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentLessonId, onSelectLesson }) => {
    return (
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    KMP for Web Devs
                </h1>
                <p className="text-xs text-gray-500 mt-1">React 转 Kotlin 速成</p>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {LESSONS.map((lesson) => (
                        <li key={lesson.id}>
                            <button
                                onClick={() => onSelectLesson(lesson)}
                                className={`w-full text-left px-4 py-3 rounded-md text-sm transition-all duration-200 ${
                                    currentLessonId === lesson.id
                                        ? 'bg-gray-800 text-white border-l-4 border-indigo-500'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                }`}
                            >
                                {lesson.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
                Powered by Gemini 2.5
            </div>
        </div>
    );
};