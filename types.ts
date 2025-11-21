export enum Sender {
    USER = 'USER',
    AI = 'AI',
    SYSTEM = 'SYSTEM'
}

export interface Message {
    id: string;
    text: string;
    sender: Sender;
    imageUrl?: string;
    isThinking?: boolean;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string;
    codeExample?: string; // Changed from comparison object to single string
    diagramPrompt: string; // Prompt to send to Nano Banana
    videoPrompt?: string; // Optional prompt for Veo video generation
}

export enum LoadingState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}