import type { IAIProvider } from './AIProvider';
import { MockProvider } from './MockProvider';

let activeProvider: IAIProvider | null = null;

export function getAIProvider(): IAIProvider {
  if (!activeProvider) {
    // Default to MockProvider as per the prompt instructions.
    // In the future, this can read from environment variables or settings
    // to instantiate OpenAIProvider, ClaudeProvider, etc.
    activeProvider = new MockProvider();
  }
  return activeProvider;
}

export function setAIProvider(provider: IAIProvider) {
  activeProvider = provider;
}
