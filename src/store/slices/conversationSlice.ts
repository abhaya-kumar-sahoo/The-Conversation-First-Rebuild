import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage, MessageRole, ArtifactType } from '@/types';
import { getAIProvider } from '@/providers';
import { nanoid } from '@reduxjs/toolkit';
import { createArtifact } from './artifactSlice';
import { addToast } from './uiSlice';

function getArtifactTitle(intentPayload: Record<string, unknown>, type: string): string {
  const titles: Record<string, string> = {
    'queue-editor': `${(intentPayload.name as string) || (intentPayload.queue as { name: string })?.name || 'Queue'} Editor`,
    'queue-list': 'Call Queues',
    'ivr-builder': `${(intentPayload.name as string) || 'IVR'} Flow Builder`,
    'contact-table': 'Contact Directory',
    'manager-table': 'Management Team',
    'dashboard': 'Live Dashboard',
    'report': 'Performance Report',
    'analytics': 'Call Analytics',
    'recordings': 'Call Recordings',
    'confirmation-dialog': 'Confirm Action',
    'campaign-builder': 'Campaign Builder',
    'approval-sheet': 'Approvals',
    'timeline': 'Timeline',
    'search-results': 'Search Results',
    'empty-state': 'Empty',
  };
  return titles[type] || 'Workspace';
}

interface ConversationState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  conversationId: string;
}

const initialState: ConversationState = {
  messages: [
    {
      id: 'welcome-msg',
      role: 'assistant' as MessageRole,
      content: 'Hello! I\'m your **Call Center AI** assistant.\n\nDescribe what you need and I\'ll create the right interface for you. Try:\n\n- "Create a Sales queue with Least Recent strategy"\n- "Show today\'s call recordings"\n- "Generate weekly performance report"\n- "Create IVR for customer support"\n\nPress **Ctrl+K** for quick commands.',
      status: 'sent',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Show dashboard',
        'Create a Sales queue',
        'Show today\'s recordings',
        'Generate weekly report',
      ],
    },
  ],
  isStreaming: false,
  streamingMessageId: null,
  conversationId: nanoid(),
};

// Simulates streaming by progressively revealing text
export const sendMessage = createAsyncThunk(
  'conversation/sendMessage',
  async (userInput: string, { dispatch }) => {
    const conversationId = nanoid();

    // Add user message
    const userMessageId = nanoid();
    dispatch(conversationSlice.actions.addMessage({
      id: userMessageId,
      role: 'user',
      content: userInput,
      status: 'sent',
      timestamp: new Date().toISOString(),
    }));

    // Parse intent using the active provider
    const provider = getAIProvider();
    const intent = await provider.parseIntent(userInput);

    // Add streaming assistant message
    const assistantMessageId = nanoid();
    dispatch(conversationSlice.actions.addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      timestamp: new Date().toISOString(),
      artifactType: intent.artifactType as ArtifactType | undefined,
      isStreaming: true,
    }));
    dispatch(conversationSlice.actions.setStreaming({ isStreaming: true, messageId: assistantMessageId }));

    // Simulate streaming text
    const fullText = intent.responseText;
    const words = fullText.split(' ');
    let current = '';

    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      dispatch(conversationSlice.actions.updateStreamingContent({
        messageId: assistantMessageId,
        content: current,
      }));
      await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
    }

    // Finalize message
    dispatch(conversationSlice.actions.finalizeMessage({
      messageId: assistantMessageId,
      suggestions: intent.suggestions || [],
    }));
    dispatch(conversationSlice.actions.setStreaming({ isStreaming: false, messageId: null }));

    if (intent.artifactType) {
      dispatch(createArtifact({
        type: intent.artifactType,
        title: getArtifactTitle(intent.payload, intent.artifactType),
        payload: intent.payload,
        conversationId: nanoid(),
      }));

      dispatch(addToast({
        id: nanoid(),
        type: 'success',
        title: 'Artifact created',
        description: `${getArtifactTitle(intent.payload, intent.artifactType)} is ready`,
      }));
    }

    return { intent, conversationId };
  }
);

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    updateStreamingContent(state, action: PayloadAction<{ messageId: string; content: string }>) {
      const msg = state.messages.find(m => m.id === action.payload.messageId);
      if (msg) {
        msg.content = action.payload.content;
      }
    },
    finalizeMessage(state, action: PayloadAction<{ messageId: string; suggestions: string[] }>) {
      const msg = state.messages.find(m => m.id === action.payload.messageId);
      if (msg) {
        msg.status = 'sent';
        msg.isStreaming = false;
        msg.suggestions = action.payload.suggestions;
      }
    },
    setStreaming(state, action: PayloadAction<{ isStreaming: boolean; messageId: string | null }>) {
      state.isStreaming = action.payload.isStreaming;
      state.streamingMessageId = action.payload.messageId;
    },
    clearMessages(state) {
      state.messages = [initialState.messages[0]];
    },
  },
});

export const { addMessage, clearMessages } = conversationSlice.actions;
export default conversationSlice.reducer;
