import type { ParsedIntent, IntentType, ArtifactType } from '@/types';
import type { IAIProvider } from './AIProvider';

const SYSTEM_PROMPT = `
You are an AI assistant routing intents for a Call Center Admin Panel.
Given the user's input, map it to exactly ONE of the following IntentTypes:
'create-queue', 'edit-queue', 'delete-queue', 'assign-agents', 'unassign-agents', 
'create-ivr', 'edit-ivr', 'show-contacts', 'show-managers', 'show-dashboard', 
'show-recordings', 'generate-report', 'generate-document', 'search', 
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
'dashboard', 'report', 'analytics', 'editable-document', 'recordings', 
'confirmation-dialog', 'campaign-builder', 'approval-sheet', 'timeline', 
'search-results', 'empty-state'
`;

export class OllamaProvider implements IAIProvider {
  private baseUrl = 'http://localhost:11434/api/generate';
  private model = 'llama3.1:latest'; // or mistral, phi3, etc.

  async parseIntent(input: string): Promise<ParsedIntent> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `${SYSTEM_PROMPT}\n\nUser Input: "${input}"\n\nJSON:`,
          stream: false,
          format: 'json', // Forces Ollama into JSON mode
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.response.trim();

      const parsed = JSON.parse(rawText) as Partial<ParsedIntent>;
      const resolvedType = (parsed.type as IntentType) || 'unknown';
      
      // Fallback mapping in case the LLM hallucinates the artifactType
      const artifactMapping: Record<string, string> = {
        'create-queue': 'queue-editor', 'edit-queue': 'queue-editor', 'delete-queue': 'confirmation-dialog',
        'show-queues': 'queue-list', 'assign-agents': 'queue-editor', 'unassign-agents': 'queue-editor',
        'create-ivr': 'ivr-builder', 'edit-ivr': 'ivr-builder', 'create-campaign': 'campaign-builder',
        'show-approvals': 'approval-sheet', 'show-timeline': 'timeline', 'show-contacts': 'contact-table',
        'show-managers': 'manager-table', 'show-dashboard': 'dashboard', 'show-recordings': 'recordings',
        'generate-report': 'report', 'show-analytics': 'analytics', 'generate-document': 'editable-document',
        'search': 'search-results'
      };

      let finalArtifactType = parsed.artifactType;
      if (!finalArtifactType || finalArtifactType === 'null' || finalArtifactType.includes('<')) {
        finalArtifactType = artifactMapping[resolvedType] as ArtifactType || null;
      }

      console.log("Ollama Response:", parsed);

      return {
        type: resolvedType,
        confidence: 0.9,
        payload: parsed.payload || {},
        artifactType: finalArtifactType as ArtifactType,
        responseText: parsed.responseText || "I couldn't process that properly.",
        suggestions: parsed.suggestions || ['Show dashboard'],
      };
    } catch (error) {
      console.error('Ollama Parsing Error:', error);
      return {
        type: 'unknown',
        confidence: 0,
        payload: {},
        artifactType: null,
        responseText: 'Error connecting to Ollama. Make sure it is running locally on port 11434.',
        suggestions: ['Retry'],
      };
    }
  }
}
