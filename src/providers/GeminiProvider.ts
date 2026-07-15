import type { ParsedIntent } from '@/types';
import type { IAIProvider } from './AIProvider';

const SYSTEM_PROMPT = `
You are an AI assistant routing intents for a Call Center Admin Panel.
Given the user's input, map it to exactly ONE of the following IntentTypes:
'create-queue', 'edit-queue', 'delete-queue', 'assign-agents', 'unassign-agents', 
'create-ivr', 'edit-ivr', 'show-contacts', 'show-managers', 'show-dashboard', 
'show-recordings', 'generate-report', 'search', 
'show-analytics', 'show-queues', 'create-campaign', 'show-approvals', 
'show-timeline', 'help', 'unknown'

You must return ONLY a raw JSON object with this exact structure, no markdown formatting, no backticks, no conversational text:
{
  "type": "<IntentType>",
  "artifactType": "<Matching ArtifactType or null>",
  "payload": { 
     // Any extracted variables like name, queueName, agentIds (array of strings), query etc.
  },
  "responseText": "A conversational response to the user acknowledging the action.",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

ArtifactTypes you can use:
'queue-editor', 'queue-list', 'ivr-builder', 'contact-table', 'manager-table', 
'dashboard', 'report', 'analytics', 'recordings', 
'confirmation-dialog', 'campaign-builder', 'approval-sheet', 'timeline', 
'search-results', 'empty-state'
`;

export class GeminiProvider implements IAIProvider {
  // NOTE: You must set VITE_GEMINI_API_KEY in your .env.local file
  private apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  async parseIntent(input: string): Promise<ParsedIntent> {
    if (!this.apiKey) {
      return this.fallbackError('Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env');
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Input: "${input}"\n\nJSON:` }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(rawText) as Partial<ParsedIntent>;

      return {
        type: parsed.type || 'unknown',
        confidence: 0.9,
        payload: parsed.payload || {},
        artifactType: parsed.artifactType || null,
        responseText: parsed.responseText || "I processed your request.",
        suggestions: parsed.suggestions || ['Show dashboard'],
      };
    } catch (error) {
      console.error('Gemini Parsing Error:', error);
      return this.fallbackError('Error connecting to Gemini API.');
    }
  }

  private fallbackError(message: string): ParsedIntent {
    return {
      type: 'unknown',
      confidence: 0,
      payload: {},
      artifactType: null,
      responseText: message,
      suggestions: ['Retry'],
    };
  }
}
