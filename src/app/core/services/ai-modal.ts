import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { apiEndPoints, Script } from '../../constants';
import { bindPromptScript } from '../../utils';

@Injectable({
  providedIn: 'root',
})
export class GoogleAiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: apiEndPoints.geminiApiKey,
    });
  }

  //   async generateChatSummary(modalName: Script, payload: string): Promise<string> {
  //     try {
  //       const modal = bindPromptScript(modalName);
  //       const content = modal(payload);

  //       console.log('modal and content', modal, content);

  //       const response = await this.ai.models.generateContent({
  //         model: 'gemini-3-flash-preview',
  //         contents: content,
  //       });
  //       console.log('AI GENEARATED RESPONSE ', response.text);
  //       return response.text ?? '';
  //     } catch (error) {
  //       console.error('AI Error:', error);
  //       throw error;
  //     }
  //   }

  async AiGeneratedResponse(modalName: Script, payload: string): Promise<string> {
    const key = apiEndPoints.groqApiKey;
    const URL = apiEndPoints.AIUrl;
    const modal = bindPromptScript(modalName);
    const promptContent = modal(payload);

    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: promptContent }],
          temperature: 0.5,
          max_completion_tokens: 1024,
        }),
      });

      if (!response.ok) {
        return 'Service is currently unavailable. Please try again later.';
      }

      const data = await response.json();
      const botReply = data?.choices?.[0]?.message?.content;
      return botReply ?? 'Something went wrong. Please try again later.';
    } catch (err) {
      return 'Service is currently unavailable. Please try again later.';
    }
  }
}
