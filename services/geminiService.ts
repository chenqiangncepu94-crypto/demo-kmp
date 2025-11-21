import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize API client
// Note: For Veo, we re-initialize with the latest key inside the function
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model constants
const IMAGE_MODEL = 'gemini-2.5-flash-image'; 
const TEXT_MODEL = 'gemini-2.5-flash'; 
const VIDEO_MODEL = 'veo-3.1-fast-generate-preview';

export const generateDiagram = async (prompt: string): Promise<string> => {
    try {
        const imagePrompt = `
        Create a clear, technical flowchart or architecture diagram.
        Style: Hand-drawn sketch style on a whiteboard or clean vector graphics.
        Subject: ${prompt}
        Ensure high contrast and legible text.
        `;

        const response = await ai.models.generateContent({
            model: IMAGE_MODEL,
            contents: {
                parts: [
                    { text: imagePrompt }
                ]
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        throw new Error("No image data received from Gemini.");

    } catch (error) {
        console.error("Error generating diagram:", error);
        throw error;
    }
};

export const generateVideo = async (prompt: string): Promise<string> => {
    try {
        // Create a new instance to ensure we use the latest selected API key if applicable
        const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let operation = await videoAi.models.generateVideos({
            model: VIDEO_MODEL,
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            operation = await videoAi.operations.getVideosOperation({operation: operation});
        }

        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!uri) throw new Error("No video URI returned from Veo.");

        // Fetch the actual video binary using the API key
        const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error("Failed to download video content.");
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error generating video:", error);
        throw error;
    }
};

export const askTutor = async (question: string, history: string[] = []): Promise<string> => {
    try {
        const fullPrompt = `
        ${SYSTEM_INSTRUCTION}
        
        Previous context:
        ${history.join('\n')}
        
        User Question: ${question}
        `;

        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: fullPrompt,
        });

        return response.text || "Sorry, I couldn't generate an explanation.";
    } catch (error) {
        console.error("Error asking tutor:", error);
        return "I encountered an error trying to reach the AI tutor.";
    }
};