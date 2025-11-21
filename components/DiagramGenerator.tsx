import React, { useState } from 'react';
import { generateDiagram } from '../services/geminiService';
import { LoadingState } from '../types';

interface DiagramGeneratorProps {
    lessonPrompt: string;
    lessonTitle: string;
}

export const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ lessonPrompt, lessonTitle }) => {
    const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        setStatus(LoadingState.LOADING);
        try {
            const url = await generateDiagram(lessonPrompt);
            setImageUrl(url);
            setStatus(LoadingState.SUCCESS);
        } catch (error) {
            setStatus(LoadingState.ERROR);
        }
    };

    return (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    AI 可视化讲解
                </h3>
                {status === LoadingState.IDLE && (
                    <button 
                        onClick={handleGenerate}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors"
                    >
                        生成流程图 (Gemini Nano)
                    </button>
                )}
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
                点击按钮，让 AI 为 "{lessonTitle}" 生成一张流程图或架构图，帮助你理解。
            </p>

            <div className="min-h-[300px] flex items-center justify-center bg-gray-900 rounded border border-dashed border-gray-700 relative overflow-hidden">
                {status === LoadingState.LOADING && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-indigo-400 text-sm animate-pulse">Rendering with Gemini Nano...</span>
                    </div>
                )}

                {status === LoadingState.SUCCESS && imageUrl && (
                    <img 
                        src={imageUrl} 
                        alt="AI Generated Diagram" 
                        className="max-w-full h-auto rounded shadow-lg animate-fade-in"
                    />
                )}

                {status === LoadingState.ERROR && (
                    <div className="text-center">
                         <p className="text-red-400 mb-2">生成失败</p>
                         <button onClick={handleGenerate} className="text-sm underline text-gray-400">重试</button>
                    </div>
                )}

                {status === LoadingState.IDLE && (
                    <span className="text-gray-600 text-sm">图表区域</span>
                )}
            </div>
        </div>
    );
};