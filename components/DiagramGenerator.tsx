
import React, { useState, useEffect } from 'react';
import { generateDiagram } from '../services/geminiService';
import { LoadingState } from '../types';

interface DiagramGeneratorProps {
    lessonId: string;
    lessonPrompt: string;
    lessonTitle: string;
    savedImageUrl?: string;
    onSave: (url: string) => void;
}

export const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ 
    lessonId, 
    lessonPrompt, 
    lessonTitle, 
    savedImageUrl, 
    onSave 
}) => {
    const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
    // currentUrl holds the potentially unsaved, newly generated image.
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // If a saved image exists, we want to show it, but currentUrl takes precedence if user just clicked generate
    const displayUrl = currentUrl || savedImageUrl;
    const isSaved = savedImageUrl === displayUrl;

    // Reset local state when lesson changes (handled by key in App, but good practice)
    useEffect(() => {
        setCurrentUrl(null);
        setStatus(savedImageUrl ? LoadingState.SUCCESS : LoadingState.IDLE);
    }, [lessonId, savedImageUrl]);

    const handleGenerate = async () => {
        setStatus(LoadingState.LOADING);
        try {
            const url = await generateDiagram(lessonPrompt);
            setCurrentUrl(url);
            setStatus(LoadingState.SUCCESS);
        } catch (error) {
            setStatus(LoadingState.ERROR);
        }
    };

    const handleSave = () => {
        if (currentUrl) {
            onSave(currentUrl);
            // Once saved, we can effectively clear the local override since they match now,
            // but keeping it is fine too.
        }
    };

    return (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    AI 可视化讲解
                </h3>
                
                <div className="flex gap-2">
                    {/* Generate / Regenerate Button */}
                    <button 
                        onClick={handleGenerate}
                        disabled={status === LoadingState.LOADING}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-2 border border-gray-600"
                    >
                        {status === LoadingState.LOADING ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                生成中...
                            </>
                        ) : displayUrl ? '重新生成' : '生成流程图 (Gemini Nano)'}
                    </button>

                    {/* Save Button - Only show if we have a URL, it's not loading, and it's different from what's saved */}
                    {status === LoadingState.SUCCESS && displayUrl && !isSaved && (
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                            </svg>
                            保存结果
                        </button>
                    )}
                    
                    {/* Saved Indicator */}
                    {isSaved && displayUrl && (
                        <span className="px-3 py-2 text-green-400 text-sm font-medium flex items-center gap-1 bg-green-900/20 rounded border border-green-900/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            已保存
                        </span>
                    )}
                </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
                让 AI 为 "{lessonTitle}" 生成架构图。如果满意，请点击保存，否则切换课程后将丢失。
            </p>

            <div className="min-h-[300px] bg-gray-900 rounded border border-dashed border-gray-700 relative overflow-hidden flex flex-col items-center justify-center group">
                {status === LoadingState.LOADING && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-indigo-400 text-sm animate-pulse">Rendering diagram...</span>
                    </div>
                )}

                {displayUrl && status !== LoadingState.LOADING && (
                    <div className="relative w-full h-full flex items-center justify-center p-2 cursor-zoom-in" onClick={() => setIsModalOpen(true)}>
                        <img 
                            src={displayUrl} 
                            alt="AI Generated Diagram" 
                            className="max-w-full max-h-[500px] object-contain rounded shadow-lg animate-fade-in"
                        />
                        {/* Hover Overlay for Zoom Hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                             <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                点击放大
                             </div>
                        </div>
                    </div>
                )}

                {status === LoadingState.ERROR && (
                    <div className="text-center">
                         <p className="text-red-400 mb-2">生成失败</p>
                         <button onClick={handleGenerate} className="text-sm underline text-gray-400">重试</button>
                    </div>
                )}

                {!displayUrl && status === LoadingState.IDLE && (
                    <div className="flex flex-col items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">图表区域 (点击生成)</span>
                    </div>
                )}
            </div>

            {/* Full Screen Modal */}
            {isModalOpen && displayUrl && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative max-w-full max-h-full">
                        <img 
                            src={displayUrl} 
                            alt="Full Screen Diagram" 
                            className="max-w-full max-h-screen object-contain rounded-sm"
                        />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsModalOpen(false);
                            }}
                            className="absolute top-[-40px] right-0 text-white hover:text-gray-300"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
