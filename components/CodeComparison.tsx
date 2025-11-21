import React from 'react';

interface CodeComparisonProps {
    reactCode: string;
    composeCode: string;
}

export const CodeComparison: React.FC<CodeComparisonProps> = ({ reactCode, composeCode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700">
                <div className="bg-gray-800 px-4 py-2 text-xs font-mono text-blue-300 border-b border-gray-700 flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" className="w-4 h-4" alt="React" />
                    React / JavaScript
                </div>
                <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
                    <code>{reactCode}</code>
                </pre>
            </div>

            <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700">
                <div className="bg-gray-800 px-4 py-2 text-xs font-mono text-purple-300 border-b border-gray-700 flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png" className="w-4 h-4" alt="Kotlin" />
                    Compose / Kotlin
                </div>
                <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
                    <code>{composeCode}</code>
                </pre>
            </div>
        </div>
    );
};