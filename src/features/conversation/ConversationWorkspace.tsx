import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { sendMessage } from '@/store/slices/conversationSlice';
import { createArtifact } from '@/store/slices/artifactSlice';
import { addToast } from '@/store/slices/uiSlice';
import { parseIntent } from '@/services/aiEngine';
import { MessageBubble } from './MessageBubble';
import { PromptBox } from './PromptBox';
import type { AppDispatch } from '@/store';
import { nanoid } from '@reduxjs/toolkit';

function getArtifactTitle(intentPayload: Record<string, unknown>, type: string): string {
  const titles: Record<string, string> = {
    'queue-editor': `${(intentPayload.name as string) || (intentPayload.queue as {name: string})?.name || 'Queue'} Editor`,
    'queue-list': 'Call Queues',
    'ivr-builder': `${(intentPayload.name as string) || 'IVR'} Flow Builder`,
    'contact-table': 'Contact Directory',
    'manager-table': 'Management Team',
    'dashboard': 'Live Dashboard',
    'report': 'Performance Report',
    'analytics': 'Call Analytics',
    'editable-document': (intentPayload.title as string) || 'Document',
    'recordings': 'Call Recordings',
    'confirmation-dialog': 'Confirm Action',
    'empty-state': 'Empty',
  };
  return titles[type] || 'Workspace';
}

export function ConversationWorkspace() {
  const dispatch = useAppDispatch<AppDispatch>();
  const { messages, isStreaming } = useAppSelector(s => s.conversation);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const intent = parseIntent(text);

    // Dispatch the streaming message
    const result = await dispatch(sendMessage(text));

    // After streaming, create the artifact if applicable
    if (intent.artifactType) {
      dispatch(createArtifact({
        type: intent.artifactType,
        title: getArtifactTitle(intent.payload, intent.artifactType),
        payload: intent.payload,
        conversationId: nanoid(),
      }));

      // Toast
      dispatch(addToast({
        id: nanoid(),
        type: 'success',
        title: 'Artifact created',
        description: `${getArtifactTitle(intent.payload, intent.artifactType)} is ready`,
      }));
    }

    return result;
  }, [dispatch, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-[#a1a1aa]">AI Workspace</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="text-[10px] text-[#52525b] bg-[#18181b] border border-[#27272a] px-1.5 py-0.5 rounded font-mono">Ctrl+K</kbd>
          <span className="text-[10px] text-[#52525b]">Command Palette</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onSuggestionClick={handleSend} />
          ))}
        </AnimatePresence>
      </div>

      {/* Prompt Box */}
      <PromptBox onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}
