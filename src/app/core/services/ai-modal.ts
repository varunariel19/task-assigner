import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { apiEndPoints, Script } from '../../constants';
import { bindPromptScript } from '../../utils';

@Injectable({
    providedIn: 'root'
})
export class GoogleAiService {

    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: apiEndPoints.geminiApiKey
        });
    }

    async generateChatSummary(modalName: Script, payload: string): Promise<string> {
        try {
            const modal = bindPromptScript(modalName);
            const content = modal(payload);

            console.log("modal and content" , modal , content);

            const response = await this.ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: content
            });
            console.log("AI GENEARATED RESPONSE ", response.text);
            return response.text ?? '';
        } catch (error) {
            console.error("AI Error:", error);
            throw error;
        }
    }
}