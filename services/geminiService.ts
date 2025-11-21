import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

// Initialize API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Model constants
// Using gemini-2.5-flash-image (nano banana) for diagrams as requested
const IMAGE_MODEL = 'gemini-2.5-flash-image'; 
// Using flash for fast text responses
const TEXT_MODEL = 'gemini-2.5-flash'; 

export const generateDiagram = async (prompt: string): Promise<string> => {
    try {
        // Instruction specific to image generation
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
            config: {
               // Nano banana models do not support responseMimeType or responseSchema
            }
        });

        // Iterate through parts to find the image
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

export const askTutor = async (question: string, history: string[] = []): Promise<string> => {
    try {
        // Construct a chat-like prompt using history context
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