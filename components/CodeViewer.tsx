import React from 'react';

interface CodeViewerProps {
    code: string;
    title?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, title = "Kotlin / Wasm Source" }) => {
    return (
        <div className="my-6 bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700 shadow-xl">
            <div className="bg-gray-800 px-4 py-2 text-xs font-mono text-purple-300 border-b border-gray-700 flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png" className="w-4 h-4" alt="Kotlin" />
                {title}
            </div>
            <div className="relative group">
                <pre className="p-5 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
                    <code>{code}</code>
                </pre>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Read-only</span>
                </div>
            </div>
        </div>
    );
};