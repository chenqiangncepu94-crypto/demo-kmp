import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { LoadingState } from '../types';

// Fix: Removed conflicting global declaration. Using local interface for type assertion.
interface AIStudioWindow {
    aistudio?: {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
}

interface VideoGeneratorProps {
    prompt: string;
    lessonTitle: string;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ prompt, lessonTitle }) => {
    const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("Initializing Veo...");

    const loadingMessages = [
        "Connecting to Veo Engine...",
        "Parsing scene geometry...",
        "Rendering 3D assets...",
        "Applying lighting effects...",
        "Compiling final video stream...",
        "Almost there..."
    ];

    const handleGenerate = async () => {
        setStatus(LoadingState.LOADING);
        let msgIdx = 0;
        
        // Cycle through loading messages
        const msgInterval = setInterval(() => {
            setLoadingMessage(loadingMessages[msgIdx % loadingMessages.length]);
            msgIdx++;
        }, 3000);

        try {
            // API Key Selection Check (Mandatory for Veo)
            // Fix: Use local interface casting to avoid global type conflicts
            const win = window as unknown as AIStudioWindow;
            if (win.aistudio) {
                const hasKey = await win.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await win.aistudio.openSelectKey();
                    // Note: We proceed assuming the user selected a key. 
                    // If they cancel, the generate call below might fail or use a default environment key if present.
                }
            }

            const url = await generateVideo(prompt);
            setVideoUrl(url);
            setStatus(LoadingState.SUCCESS);
        } catch (error: any) {
            console.error("Video generation failed:", error);
            // Retry logic for specific error
            const win = window as unknown as AIStudioWindow;
            if (error.message && error.message.includes("Requested entity was not found") && win.aistudio) {
                 try {
                     await win.aistudio.openSelectKey();
                     const url = await generateVideo(prompt);
                     setVideoUrl(url);
                     setStatus(LoadingState.SUCCESS);
                 } catch (retryError) {
                     setStatus(LoadingState.ERROR);
                 }
            } else {
                setStatus(LoadingState.ERROR);
            }
        } finally {
            clearInterval(msgInterval);
        }
    };

    return (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l4 2A1 1 0 0020 14V6a1 1 0 00-1.447-.894l-4 2z" />
                    </svg>
                    Veo 视频演示
                </h3>
                
                {/* Generate Button */}
                {status !== LoadingState.LOADING && !videoUrl && (
                    <button 
                        onClick={handleGenerate}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        生成演示视频
                    </button>
                )}

                {videoUrl && (
                     <button 
                        onClick={handleGenerate}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors border border-gray-600"
                    >
                        重新生成
                    </button>
                )}
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
                使用 Google Veo 模型生成 "{lessonTitle}" 的 3D 全景演示视频。
                <br/>
                <span className="text-xs text-gray-500">* 需要选择付费 API Key 才能使用视频生成功能。</span>
            </p>

            <div className="min-h-[300px] bg-gray-900 rounded border border-dashed border-gray-700 relative overflow-hidden flex flex-col items-center justify-center">
                {status === LoadingState.LOADING && (
                    <div className="flex flex-col items-center gap-4 p-8">
                        <div className="relative w-16 h-16">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/30 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span className="text-indigo-400 text-sm animate-pulse font-mono">{loadingMessage}</span>
                    </div>
                )}

                {videoUrl && status === LoadingState.SUCCESS && (
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        loop
                        className="w-full max-h-[500px] rounded shadow-lg"
                    />
                )}

                {status === LoadingState.ERROR && (
                    <div className="text-center p-6">
                         <p className="text-red-400 mb-2">视频生成失败</p>
                         <p className="text-xs text-gray-500 mb-4">可能是 API Key 未选择或配额不足。</p>
                         <button onClick={handleGenerate} className="text-sm underline text-indigo-400">重试</button>
                    </div>
                )}

                {!videoUrl && status === LoadingState.IDLE && (
                    <div className="flex flex-col items-center text-gray-600 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">点击上方按钮开始生成视频</span>
                    </div>
                )}
            </div>
        </div>
    );
};