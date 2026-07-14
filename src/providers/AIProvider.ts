import type { ParsedIntent } from '@/types';

export interface IAIProvider {
  /**
   * Parses the user's natural language input into a structured intent.
   * This method is asynchronous to support future remote API calls (e.g., OpenAI, Claude).
   */
  parseIntent(input: string): Promise<ParsedIntent>;
}
