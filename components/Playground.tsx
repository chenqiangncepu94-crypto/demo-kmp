import React, { useState, useEffect } from 'react';

// Mock parser types
interface ParsedElement {
    type: 'Text' | 'Button' | 'Spacer' | 'Column' | 'Unknown';
    props: Record<string, any>;
    children?: ParsedElement[];
    content?: string;
    action?: 'INCREMENT' | 'DECREMENT' | 'RESET' | 'TOAST' | 'NONE';
    payload?: number; // Added for variable increment
}

export const Playground: React.FC = () => {
    // Initial code showcasing state and events
    const [code, setCode] = useState(
`// 互动体验：点击按钮修改状态 (模拟)
// Compose 核心：状态驱动 UI

var count by remember { mutableStateOf(0) }

Column {
    Text("Counter: $count", fontSize = 32, color = Color.Blue)
    
    Spacer(height = 20)
    
    Button(onClick = { count++ }) {
        Text("Increment (+1)")
    }

    Spacer(height = 10)
    
    // 尝试点击下面的 "快速插入" 添加更多事件
    Button(onClick = { count += 5 }) {
        Text("Add 5 (Quick)")
    }

    Spacer(height = 10)

    Button(onClick = { count = 0 }) {
        Text("Reset", color = Color.Red)
    }
}`);

    // Simulated Runtime State
    const [count, setCount] = useState(0);
    const [toast, setToast] = useState<string | null>(null);
    const [parsedElements, setParsedElements] = useState<ParsedElement[]>([]);

    // Helper to show temporary toast
    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    // A primitive "Compiler" that uses Regex to identify known Compose patterns.
    // Now supports variable interpolation ($count) and basic actions.
    const parseCode = (input: string, currentCount: number): ParsedElement[] => {
        const lines = input.split('\n');
        const elements: ParsedElement[] = [];
        
        // Stack to handle basic nesting (only supports 1 level of nesting for this demo)
        let currentParent: ParsedElement | null = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('var')) return;

            // Parse Text
            if (trimmed.startsWith('Text')) {
                const contentMatch = trimmed.match(/Text\("([^"]+)"/);
                const colorMatch = trimmed.match(/color\s*=\s*Color\.(\w+)/);
                const sizeMatch = trimmed.match(/fontSize\s*=\s*(\d+)/);
                
                let textContent = contentMatch ? contentMatch[1] : 'Text';
                // Simulate Kotlin String Interpolation
                if (textContent.includes('$count')) {
                    textContent = textContent.replace('$count', currentCount.toString());
                }

                const el: ParsedElement = {
                    type: 'Text',
                    props: {
                        color: colorMatch ? colorMatch[1].toLowerCase() : 'black', // Default to black/white depending on theme, handled in render
                        fontSize: sizeMatch ? parseInt(sizeMatch[1]) : 16
                    },
                    content: textContent
                };

                if (currentParent) {
                    currentParent.children?.push(el);
                } else {
                    elements.push(el);
                }
            }
            // Parse Button Start
            else if (trimmed.startsWith('Button')) {
                // Detect Actions in onClick lambda
                let action: ParsedElement['action'] = 'NONE';
                let payload = 1;

                if (trimmed.includes('count++')) {
                    action = 'INCREMENT';
                    payload = 1;
                } else if (trimmed.match(/count\s*\+=\s*(\d+)/)) {
                    action = 'INCREMENT';
                    const m = trimmed.match(/count\s*\+=\s*(\d+)/);
                    payload = m ? parseInt(m[1]) : 1;
                } else if (trimmed.includes('count--')) {
                    action = 'DECREMENT';
                    payload = 1;
                } else if (trimmed.match(/count\s*\-=\s*(\d+)/)) {
                    action = 'DECREMENT';
                    const m = trimmed.match(/count\s*\-=\s*(\d+)/);
                    payload = m ? parseInt(m[1]) : 1;
                } else if (trimmed.includes('count = 0')) {
                    action = 'RESET';
                } else if (trimmed.includes('println') || trimmed.includes('Toast')) {
                    action = 'TOAST';
                }

                const btn: ParsedElement = {
                    type: 'Button',
                    props: {},
                    children: [],
                    action: action,
                    payload: payload
                };
                currentParent = btn;
                elements.push(btn);
            }
            // Parse Spacer
            else if (trimmed.startsWith('Spacer')) {
                const heightMatch = trimmed.match(/height\s*=\s*(\d+)/);
                const el: ParsedElement = {
                    type: 'Spacer',
                    props: { height: heightMatch ? parseInt(heightMatch[1]) : 10 }
                };
                if (currentParent) currentParent.children?.push(el);
                else elements.push(el);
            }
            // Parse Closing Brace
            else if (trimmed === '}') {
                currentParent = null;
            }
        });

        return elements;
    };

    // Re-compile when code or state changes
    useEffect(() => {
        const elements = parseCode(code, count);
        setParsedElements(elements);
    }, [code, count]);

    const insertCode = (snippet: string) => {
        // Insert inside the column closure if possible, otherwise append
        if (code.includes('}')) {
            const lastBraceIndex = code.lastIndexOf('}');
            const newCode = code.substring(0, lastBraceIndex) + '    ' + snippet + '\n' + code.substring(lastBraceIndex);
            setCode(newCode);
        } else {
             setCode(prev => prev + '\n    ' + snippet);
        }
    };

    // Renderer Component
    const RenderElement: React.FC<{ element: ParsedElement }> = ({ element }) => {
        if (element.type === 'Text') {
            // Handle generic color mapping
            const colorMap: Record<string, string> = {
                'blue': '#3b82f6',
                'red': '#ef4444',
                'green': '#22c55e',
                'gray': '#6b7280',
                'white': '#ffffff',
                'black': '#1f2937' // Default text color on phone
            };
            const finalColor = colorMap[element.props.color] || element.props.color;

            return (
                <div style={{ 
                    color: finalColor, 
                    fontSize: `${element.props.fontSize}px`,
                    marginBottom: '4px'
                }} className="font-sans transition-all duration-300 font-medium">
                    {element.content}
                </div>
            );
        }
        if (element.type === 'Spacer') {
            return <div style={{ height: `${element.props.height}px`, width: '100%' }} />;
        }
        if (element.type === 'Button') {
            const handleClick = () => {
                const val = element.payload || 1;
                if (element.action === 'INCREMENT') setCount(c => c + val);
                if (element.action === 'DECREMENT') setCount(c => c - val);
                if (element.action === 'RESET') setCount(0);
                if (element.action === 'TOAST') showToast("System.out: Hello KMP!");
            };

            return (
                <button 
                    onClick={handleClick}
                    className="w-full max-w-[200px] px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md text-white transition-all duration-200 transform active:scale-95 flex flex-col items-center gap-1 border-b-4 border-indigo-800 active:border-b-0 active:mt-1"
                >
                    {element.children?.map((child, i) => <RenderElement key={i} element={child} />)}
                </button>
            );
        }
        return null;
    };

    return (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
            {/* Editor Pane */}
            <div className="flex flex-col bg-[#1e1e1e] rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="ml-2">Main.kt</span>
                    </div>
                    <span className="text-indigo-400">Kotlin Compose Editor</span>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 bg-[#1e1e1e] text-blue-100 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                />
                {/* Quick Actions / Hints */}
                <div className="p-3 bg-gray-800 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">快速插入代码 (Quick Insert):</p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => insertCode('Button(onClick = { count++ }) {\n        Text("Add 1")\n    }')} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-green-400 rounded border border-gray-600 transition-colors">
                            + count++
                        </button>
                        <button onClick={() => insertCode('Button(onClick = { count += 5 }) {\n        Text("Add 5")\n    }')} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-green-400 rounded border border-gray-600 transition-colors">
                            + count += 5
                        </button>
                        <button onClick={() => insertCode('Button(onClick = { count-- }) {\n        Text("Dec (-1)")\n    }')} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-yellow-400 rounded border border-gray-600 transition-colors">
                            + count--
                        </button>
                        <button onClick={() => insertCode('Button(onClick = { count = 0 }) {\n        Text("Reset")\n    }')} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-red-400 rounded border border-gray-600 transition-colors">
                            + Reset
                        </button>
                        <button onClick={() => insertCode('Button(onClick = { println("Hello") }) {\n        Text("Toast")\n    }')} className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-blue-400 rounded border border-gray-600 transition-colors">
                            + Toast
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Pane */}
            <div className="flex flex-col bg-gray-900 rounded-lg border border-gray-700 shadow-2xl overflow-hidden relative">
                <div className="bg-gray-800 px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700 flex justify-between items-center">
                    <span className="uppercase tracking-widest">Wasm Simulator</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1 bg-gray-700 rounded text-gray-300">State: {count}</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
                
                <div className="flex-1 bg-gray-900 flex items-center justify-center p-8 relative">
                    {/* Phone/Window Simulation */}
                    <div className="w-[300px] h-[500px] bg-white text-black rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800 flex flex-col relative ring-1 ring-gray-700">
                        {/* Phone Notch/Bar */}
                        <div className="h-8 bg-gray-100 w-full flex justify-between items-center px-6 border-b border-gray-200">
                             <span className="text-[10px] font-bold text-gray-500">9:41</span>
                             <div className="flex gap-1">
                                 <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                 <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                             </div>
                        </div>
                        
                        {/* App Content */}
                        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto bg-gray-50">
                            {parsedElements.map((el, i) => (
                                <RenderElement key={i} element={el} />
                            ))}
                            
                            {parsedElements.length === 0 && (
                                <span className="text-gray-400 text-sm">Empty Layout</span>
                            )}
                        </div>

                        {/* Simulated Toast */}
                        {toast && (
                            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-4 py-2 rounded-full shadow-lg animate-fade-in-up">
                                {toast}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};