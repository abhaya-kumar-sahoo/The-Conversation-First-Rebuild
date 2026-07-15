import type { IAIProvider } from './AIProvider';
import { MockProvider } from './MockProvider';
import { OllamaProvider } from './OllamaProvider';
import { GeminiProvider } from './GeminiProvider';

let activeProvider: IAIProvider | null = null;

export function getAIProvider(): IAIProvider {
  if (!activeProvider) {
    // -------------------------------------------------------------
    // CHANGE THIS LINE TO TEST DIFFERENT AI MODELS
    // -------------------------------------------------------------
    // activeProvider = new MockProvider(); 
    activeProvider = new OllamaProvider();
    // activeProvider = new GeminiProvider();
  }
  return activeProvider;
}

export function setAIProvider(provider: IAIProvider) {
  activeProvider = provider;
}
