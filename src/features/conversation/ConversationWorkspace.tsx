import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { sendMessage } from '@/store/slices/conversationSlice';
import { MessageBubble } from './MessageBubble';
import { PromptBox } from './PromptBox';

export function ConversationWorkspace() {
  const dispatch = useAppDispatch();
  const { messages, isStreaming } = useAppSelector(s => s.conversation);
  // console.log({ messages });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Dispatch the streaming message which now automatically handles artifact creation
    const result = await dispatch(sendMessage(text));

    return result;
  }, [dispatch, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[800px] bg-teal-700/20 blur-[200px] rounded-full pointer-events-none z-0" />
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
