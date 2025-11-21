
import { Lesson } from './types';

export const SYSTEM_INSTRUCTION = `You are a Senior Compiler Engineer and Kotlin Multiplatform Expert. 
Your goal is to teach a frontend developer about the internal workings of Kotlin Multiplatform, specifically targeting WebAssembly (Wasm).
The user has a React background. Use analogies they understand (e.g., Babel, Virtual DOM vs Shadow DOM, Webpack).
Crucially, explain the transformation from Kotlin Source -> IR -> Wasm Binary.
`;

export const LESSONS: Lesson[] = [
    {
        id: 'lesson_1_concept',
        title: '1. 新的世界观: KMP & Wasm',
        description: '为什么说它不像 React，而更像 Unity/Flutter？',
        content: `
### 前端视角的 KMP

作为 React 开发者，你习惯了：
*   **React**: 你的代码 -> Babel -> JS -> 浏览器 (V8) 操作 DOM。
*   **UI**: HTML 标签 (\`div\`, \`span\`) + CSS。

Kotlin Multiplatform (Wasm) 是完全不同的路径：
*   **KMP**: 你的代码 -> K2 编译器 -> **.wasm 二进制** -> 浏览器 (Wasm 虚拟机)。
*   **UI**: **Skia 引擎** (C++ 编译成 Wasm) -> 在一个 \`<canvas>\` 上画出像素。

### 为什么要学这个？
Wasm 是 Web 的汇编语言。它不是为了取代 JS，而是为了**高计算密集型**任务。
Compose Multiplatform 让你用一套 Kotlin 代码，既能跑在 Android/iOS (原生性能)，又能跑在 Web (Wasm 性能)。

我们接下来将通过一个简单的 **"计数器 (Counter)"** 应用，带你走完从代码到像素的全过程。
        `,
        codeExample: `// 我们的目标：跨平台的 Hello World
// 这段代码将在 Android, iOS 和 浏览器上运行

@Composable
fun App() {
    MaterialTheme {
        // 这不是 HTML div，这是 Skia 绘制的一个 Box
        Box(Modifier.fillMaxSize()) {
            Text("Hello Wasm!")
        }
    }
}`,
        diagramPrompt: "Comparison diagram. Left side: 'React App' stack (JS -> Virtual DOM -> Real DOM). Right side: 'Compose Wasm' stack (Kotlin -> Wasm Binary -> Skia Engine -> Canvas). Highlighting the bypass of the DOM on the right."
    },
    {
        id: 'lesson_2_demo_code',
        title: '2. 编写 Demo: 声明式 UI 的异同',
        description: '用 Kotlin 写一个计数器，感受与 React Hooks 的异同。',
        content: `
### 我们的案例：The Counter App

我们来写一个简单的计数器。你会发现它看起来极其像 React，但类型系统要强大得多。

### 关键概念对比

1.  **@Composable**: 相当于 React Component。
2.  **remember { mutableStateOf(0) }**: 相当于 \`useState(0)\`。
3.  **Modifier**: 相当于 CSS-in-JS，但它是类型安全的链式调用。

注意：这里没有 HTML。\`Column\` 不是 Flexbox 的 \`div\`，它是一个通过算法计算布局的纯逻辑节点。

当这段代码运行时，它不产生 DOM 节点，而是产生**渲染指令**。
        `,
        codeExample: `// Main.kt
import androidx.compose.runtime.*
import androidx.compose.material.*

@Composable
fun CounterApp() {
    // 1. State (Hooks)
    var count by remember { mutableStateOf(0) }

    // 2. Layout (Like Flexbox column)
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // 3. UI Component
        Text(
            text = "Count: $count",
            style = MaterialTheme.typography.h3
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // 4. Event Handling
        Button(onClick = { count++ }) {
            Text("Increment")
        }
    }
}`,
        diagramPrompt: "Visual representation of the 'Counter App' UI. A simple window with a large number '0' in the center and an 'Increment' button below it. Annotate with 'Skia Canvas Rendering' not 'DOM HTML'."
    },
    {
        id: 'lesson_3_compilation',
        title: '3. 魔法核心: 从 Kotlin 到 Wasm',
        description: '这是你最关心的部分：编译器到底对你的代码做了什么？',
        content: `
### 变形记：The Compiler Pipeline

当你点击 "Build" 时，Kotlin 编译器 (K2) 启动了。这是一个将**人类逻辑**转化为**机器堆栈指令**的过程。

#### 第一步：Frontend (K2) -> IR (中间表示)
编译器首先将你的 Kotlin 代码解析成 **IR 树 (Intermediate Representation)**。
*   \`class Counter\` 变成 \`IrClass\`。
*   \`count++\` 变成 \`IrCall(plus, count, 1)\`。
此时，代码还与平台无关。

#### 第二步：Lowering (降级)
编译器针对 Wasm 目标进行几十次 "Lowering"。
*   **高阶函数**: 你的 lambda \`{ count++ }\` 被转换成一个静态类或函数句柄。
*   **挂起函数**: Coroutines 被拆解成状态机。

#### 第三步：Wasm Backend (生成二进制)
这是最关键的一步。编译器将 IR 映射为 WebAssembly (WasmGC) 标准指令。

**看看转换前后的对比 (伪代码):**

Kotlin 的类变成了 Wasm 的 \`struct\`。Kotlin 的函数变成了 Wasm 的 \`func\`。
        `,
        codeExample: `// 1. 你的 Kotlin 源码
class User(val id: Int)
fun add(a: Int, b: Int) = a + b

// -------------------------------------------
// 2. 编译生成的 Wasm (WAT 文本格式表示)
// -------------------------------------------

// 类被映射为 GC Struct (WasmGC 特性)
(type $User (struct (field (mut i32)))) 

// 函数被映射为堆栈机指令
(func $add (param $a i32) (param $b i32) (result i32)
  local.get $a   // 把参数 a 压入栈
  local.get $b   // 把参数 b 压入栈
  i32.add        // 弹出两个数相加，结果压入栈
)

// 这就是浏览器真正下载并执行的东西！`,
        diagramPrompt: "Flowchart showing the transformation steps: 1. 'Kotlin Source Code' icon. 2. Arrow to 'K2 Compiler'. 3. Arrow to 'IR Tree' (Abstract Syntax Tree visualization). 4. Arrow to 'Wasm Backend'. 5. Arrow to 'Wasm Binary' (010101). Show 'Lowering' happening between IR and Backend."
    },
    {
        id: 'lesson_4_runtime_gc',
        title: '4. 内存模型: WasmGC',
        description: 'Kotlin 对象如何在浏览器内存中存活？',
        content: `
### 传统 Wasm vs WasmGC

在旧的 Wasm (C++/Rust) 中，Wasm 拥有一块巨大的 \`Linear Memory\` (比如 2GB 的 ArrayBuffer)。C++ 代码必须自己 \`malloc\` 和 \`free\`。如果忘了 free，就内存泄漏。浏览器完全不知道这块内存里发生了什么。

**Kotlin/Wasm 不一样。**

它使用了 **WasmGC** 标准。
*   Kotlin 对象 **直接** 分配在浏览器的堆 (Heap) 上，就像 JS 对象一样。
*   它不再是一大块黑盒内存，而是结构化的数据 (Structs, Arrays)。

**这意味着：**
1.  **零开销 GC**: Kotlin 不需要自己打包一个垃圾回收器 (像 Go 语言那样需要打包几 MB 的 Runtime)。它直接用 Chrome/Safari 自带的 GC。
2.  **循环引用处理**: 浏览器可以同时检测 JS 对象和 Kotlin Wasm 对象的循环引用并回收它们。

这是 Kotlin 编译产物能做到如此之小 (几百 KB) 的核心原因。
        `,
        codeExample: `// Kotlin 代码
val list = ArrayList<String>()
list.add("Hello")

// 运行时内存视图 (WasmGC)
// 浏览器能够 "看懂" Wasm 里的数据结构

[Browser Heap]
  |-- [JS Objects (DOM Nodes, etc)]
  |
  |-- [Wasm Structs (Kotlin Objects)]
       |-- $ArrayList (ptr: 0x100)
             |-- backingArray: [Ref -> "Hello"]
  
// Chrome DevTools 甚至可以直接调试这些 Wasm 对象`,
        diagramPrompt: "Memory layout diagram. Show 'Browser Heap' as a large container. Inside, show mixed objects: 'JS Objects' (circles) and 'Wasm Structs' (squares). Show a 'Garbage Collector' broom sweeping over BOTH types of objects seamlessly."
    },
    {
        id: 'lesson_5_bootstrap',
        title: '5. 启动链路: Index.html 到 Main()',
        description: '最后一步：浏览器如何把这些二进制指令跑起来？',
        content: `
### 最终的启动流程

现在我们有了 \`app.wasm\`。这是如何变成屏幕上的画面的？

#### 1. HTML 入口
你的 \`index.html\` 很简单，只有一个 \`<canvas>\` 和一个加载脚本。

#### 2. 加载器 (The Loader)
浏览器下载 \`skiko.js\` (Skia 图形库的绑定) 和你的 \`app.wasm\`。
JS 代码调用 \`WebAssembly.instantiateStreaming\`。

#### 3. 导入与导出 (Imports & Exports)
这是最神奇的时刻。Wasm 不能直接打印日志或画图。它需要 JS "喂" 给它能力。
*   **Import**: JS 把 \`console.log\`，\`window.requestAnimationFrame\`，以及 WebGL 的绘制函数传给 Wasm 模块。
*   **Export**: Wasm 模块把它的入口函数 \`_start\` (对应 Kotlin 的 main) 暴露给 JS。

#### 4. 渲染循环
1.  JS 调用 Wasm 的 \`main()\`。
2.  Compose 运行时初始化。
3.  Compose 计算 UI 树，通过 Import 的 WebGL 函数，在 Canvas 上画出第一帧。
4.  之后每一帧，Wasm 都计算差异，只重绘变动的部分。

这就是为什么它看起来像原生应用，因为它完全绕过了 DOM，直接在 GPU 上作画。
        `,
        codeExample: `// 伪代码：模拟浏览器加载过程

// 1. 准备 Imports (Wasm 需要的能力)
const imports = {
    kotlin_js: {
        print: (text) => console.log(text) // 让 Wasm 能打印日志
    },
    skia: {
        draw: (ptr, len) => gl.drawArrays(...) // 让 Wasm 能画画
    }
};

// 2. 实例化 Wasm
const { instance } = await WebAssembly.instantiateStreaming(
    fetch('app.wasm'), 
    imports
);

// 3. 启动 Kotlin 应用
// 这一步调用了你的 fun main()
instance.exports._start(); 

console.log("Kotlin App is running!");`,
        diagramPrompt: "Sequence diagram. Actors: 'Browser', 'JS Loader', 'Wasm Module'. Steps: 1. Load HTML. 2. Fetch .wasm file. 3. Create Import Object (pass WebGL/Console functions). 4. Instantiate Wasm. 5. JS calls exports._start(). 6. Wasm calls back to WebGL to draw pixels."
    },
    {
        id: 'lesson_6_big_picture',
        title: '6. 全景图: The Engineering Blueprint',
        description: '深度解析：工程级的 KMP 架构全景。',
        content: `
### 终极总结：从代码到像素

恭喜你走到了这里！现在我们将前面所有的碎片拼凑成一张完整的、工程级的**一体化架构图**。

为了满足生产环境的复杂度要求，我们需要关注以下三个关键领域：

#### 1. 数据结构转换 (Data Structures)
这不仅是代码的翻译，更是数据形态的质变。
*   **IR Tree**: Kotlin 代码首先被解析为高层次的中间表示 (Intermediate Representation) 树。
*   **Lowering**: 这些树节点被逐步"降级"，拆解成更底层的操作。
*   **Binary**: 最终变成线性的 WebAssembly 指令流 (Stack Machine Instructions)。

#### 2. 桥接细节 (The Bridge & Import Object)
Wasm 本身是沙盒环境，它无法直接接触外部世界。
*   **Import Object**: 这是一个 JS 对象，充当 Wasm 的"感官"。它将浏览器的 WebGL 上下文、DOM 事件、Console 能力注入给 Wasm 实例。
*   **Skiko.js**: 它是 Skia 图形引擎的 JS 绑定层，负责把 Wasm 里的绘制命令 (Draw Ops) 转发给 WebGL。

#### 3. 运行时循环 (Runtime Loop)
这是一个每秒运行 60 次的高速循环：
*   **Event Loop**: 浏览器捕获鼠标/触摸事件 -> 传给 Wasm。
*   **Snapshot System**: Compose 检查状态变化，生成新的 UI 快照。
*   **Draw Ops**: Skia 根据快照生成绘制指令。
*   **WebGL**: 最终在 Canvas 上光栅化像素。
        `,
        codeExample: `/* 
   Engineering Blueprint Summary
   =========================================
   
   [A. Compiler Pipeline]
   Kotlin Source -> K2 Frontend -> IR Tree (AST) -> Lowering Phase -> Wasm Backend -> .wasm Binary
   
   [B. The Bridge (Import Object)]
   JS Environment  <--[Imports: WebGL, DOM, Console]-->  Wasm Instance
   
   [C. The Hot Loop (16ms)]
   1. Browser Event (Click/Touch)
   2. -> Dispatch to Wasm
   3. -> Compose Recomposition (Snapshot State)
   4. -> Layout & Measure
   5. -> Skia Draw Operations
   6. -> WebGL Context Render (GPU)
*/`,
        diagramPrompt: "A complex, detailed engineering blueprint schema. 3 DISTINCT SECTIONS. Section 1 'COMPILATION': Detailed flowchart from 'Kotlin Code' -> 'IR Tree (Nodes)' -> 'Wasm Binary'. Section 2 'THE BRIDGE': Close-up schematic of the 'Import Object' acting as a connector, binding 'WebGL Context' and 'JS DOM Events' into the 'Wasm Instance'. Section 3 'RUNTIME LOOP': A circular system diagram showing 'Event Loop' -> 'State Snapshot' -> 'Layout Calculation' -> 'Skia Draw Ops' -> 'GPU Rasterization'. Style: Professional CAD or Architecture Blueprint, dark blue background, white technical lines, annotated extensively.",
        videoPrompt: "A futuristic, high-tech 3D animation visualizing a compiler pipeline. The camera tracks glowing blue data packets moving through fiber optic lines, transforming into geometric code structures, then assembling into a sleek, modern user interface screen. Cyberpunk aesthetic, neon cyan and deep blue lighting, smooth motion, 16:9 aspect ratio."
    },
    {
        id: 'lesson_7_playground',
        title: '7. Playground: 动手实验室',
        description: '写几行 Kotlin，实时预览效果 (模拟器)。',
        content: `
### 你的第一个 Compose 组件

这是一个**模拟的 Compose Playground**。
虽然浏览器无法直接运行真正的 Kotlin 编译器（它太大了），但我为你准备了一个微型解释器，让你体验 Compose 的**声明式语法**。

**尝试以下修改：**
1.  修改 \`Text("...")\` 里的文字。
2.  把 \`Color.Blue\` 改成 \`Color.Red\` 或 \`Color.Green\`。
3.  复制几行 \`Text\`，看看布局如何自动排列。
4.  点击下方的 **"快速插入"** 按钮来添加代码。

注意：Compose 是通过**嵌套函数**来描述 UI 的，不需要写闭合标签 \`</div>\`，只需要 \`}\`。
        `,
        codeExample: `// 可以在右侧尝试修改这段代码
Column {
    Text("Hello KMP!", fontSize = 24, color = Color.Blue)
    Text("This is a live preview.", color = Color.Gray)
    
    Spacer(height = 20)
    
    Button(onClick = {}) {
        Text("Click Me")
    }
}`,
        diagramPrompt: "A split-screen IDE interface. Left side shows colorful Kotlin code logic. Right side shows the rendered UI result on a phone screen representation. An arrow connects code changes to immediate UI updates, labeled 'Hot Reload'."
    },
    {
        id: 'lesson_8_interpreter',
        title: '8. 幕后揭秘: 手写微型解释器',
        description: '我们是如何在没有编译器的情况下，让你的 "Kotlin" 代码跑起来的？',
        content: `
### 揭开魔术的面纱

你刚才使用的 Playground 并没有真正的 Kotlin 编译器（K2）。它是一个用 **React + TypeScript + Regex** 编写的微型解释器。

真正的编译器有 50MB+，并且在浏览器中运行需要 WebWorker 支持。为了在这个简易的 Demo 中实现 "秒开" 和 "热重载"，我采用了**领域特定语言 (DSL) 映射**的技术。

### 工作原理 (The "Fake" Pipeline)

#### 1. 词法分析 (Lexing) - Regex Magic
我没有写完整的语法树解析器 (Parser)，而是使用了**正则表达式**来识别特定的 Compose 模式：
*   识别 \`Text("...")\` -> 提取字符串内容。
*   识别 \`Button(onClick = { ... })\` -> 提取花括号内的逻辑。

#### 2. 变量绑定 (Variable Binding)
当你在代码里写 \`$count\` 时，我的解释器做了一个简单的字符串替换 (String Interpolation)，把它换成了当前 React 的 State 值。

#### 3. 动作映射 (Action Mapping)
当解析器看到 \`count++\` 或 \`count += 5\` 时，它并没有真正执行 Kotlin 代码，而是将其映射为一个 **Redux 风格的 Action**：
\`{ type: 'INCREMENT', payload: 1 }\`。
然后，这个 Action 触发了 React 的 \`setState\`。

#### 4. 渲染 (Mapping to DOM)
最终，解析出的 \`ParsedElement\` 对象树被映射回 HTML 标签：
*   Compose \`Column\` -> HTML \`flex-col\`
*   Compose \`Text\` -> HTML \`div\`
*   Compose \`Button\` -> HTML \`button\`

这就是为什么它看起来像 Kotlin，跑起来像 React。这本身也是一种跨平台思想的体现：**用声明式的 DSL 描述意图，具体的 Runtime (React/Wasm/Android) 负责实现。**
        `,
        codeExample: `// 这就是 Playground 背后的核心逻辑 (TypeScript)

// 1. 解析器：把字符串代码变成 JSON 对象树
const parseCode = (input: string, stateVal: number) => {
    const elements = [];
    
    // 作弊：使用正则匹配，而不是真正的 AST
    if (input.includes('Text')) {
       // 处理变量插值
       const text = input.match(/"(.*)"/)[1]
           .replace('$count', stateVal); 
           
       elements.push({ type: 'Text', content: text });
    }
    
    if (input.includes('Button')) {
       // 识别意图，映射为 Action
       const action = input.includes('count++') ? 'INCREMENT' : 'NONE';
       elements.push({ type: 'Button', action: action });
    }
    
    return elements;
};

// 2. 渲染器：把 JSON 对象树变成 React 组件
const Renderer = ({ element }) => {
    if (element.type === 'Text') return <div>{element.content}</div>;
    if (element.type === 'Button') return <button onClick={handleAction} />;
}`,
        diagramPrompt: "Diagram showing the 'Fake Interpreter' architecture. Left input: 'Kotlin String Code'. Middle box: 'Regex Parser Engine'. Arrows pointing to 'JSON Tree'. Right box: 'React Render Loop' consuming the JSON. Bottom: 'React State' feeding back into the input for variable interpolation."
    }
];
