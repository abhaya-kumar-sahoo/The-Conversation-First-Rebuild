import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Sparkles, CornerDownLeft } from 'lucide-react';

interface PromptBoxProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
}

const SAMPLE_PROMPTS = [
  'Create a Sales queue with Least Recent strategy',
  'Show today\'s call recordings',
  'Assign Aman and Utkarsh to Sales Queue',
  'Generate weekly performance report',
  'Create IVR for customer support',
  'Show dashboard',
  'Write onboarding SOP for new agents',
  'Show all contacts',
  'Show analytics',
];

export function PromptBox({ onSend, isStreaming }: PromptBoxProps) {
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderTyping, setIsPlaceholderTyping] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Animated placeholder typewriter
  useEffect(() => {
    const target = SAMPLE_PROMPTS[placeholderIndex];
    if (isPlaceholderTyping) {
      if (placeholder.length < target.length) {
        const timeout = setTimeout(() => {
          setPlaceholder(target.slice(0, placeholder.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setIsPlaceholderTyping(false), 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (placeholder.length > 0) {
        const timeout = setTimeout(() => {
          setPlaceholder(placeholder.slice(0, -1));
        }, 25);
        return () => clearTimeout(timeout);
      } else {
        setPlaceholderIndex((i) => (i + 1) % SAMPLE_PROMPTS.length);
        setIsPlaceholderTyping(true);
      }
    }
  }, [placeholder, placeholderIndex, isPlaceholderTyping]);

  // Keyboard shortcut: Ctrl+/
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isStreaming) return;
    onSend(value.trim());
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isStreaming, onSend]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-grow
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  return (
    <div className="px-6 pb-6 pt-2">
      <motion.div
        className="relative rounded-2xl border border-[#27272a]/80 bg-[#18181b]/60 backdrop-blur-xl shadow-lg shadow-black/40 overflow-hidden"
        whileFocusWithin={{ borderColor: 'rgba(124, 58, 237, 0.6)', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.6)' }}
        transition={{ duration: 0.2 }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isStreaming}
          rows={1}
          className="w-full bg-transparent text-[#e4e4e7] text-sm resize-none px-4 pt-4 pb-2 outline-none placeholder:text-[#52525b] disabled:opacity-50"
          style={{ minHeight: 52, maxHeight: 160 }}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            {/* Attachment (UI only) */}
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-colors"
              title="Attach file (coming soon)"
            >
              <Paperclip size={14} />
            </button>
            {/* Voice (UI only) */}
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-colors"
              title="Voice input (coming soon)"
            >
              <Mic size={14} />
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-colors"
              title="AI suggestions"
            >
              <Sparkles size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {value.length > 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] text-[#52525b] flex items-center gap-1"
                >
                  <CornerDownLeft size={10} />
                  to send
                </motion.span>
              )}
            </AnimatePresence>
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || isStreaming}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-600 text-white disabled:opacity-30 hover:bg-violet-700 transition-colors disabled:cursor-not-allowed"
            >
              {isStreaming ? (
                <motion.div
                  className="w-3 h-3 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <Send size={13} />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Shortcuts hint */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-[10px] text-[#52525b]">
          <kbd className="font-mono bg-[#18181b] border border-[#27272a] px-1 py-0.5 rounded text-[9px]">Enter</kbd> Send
        </span>
        <span className="text-[10px] text-[#52525b]">
          <kbd className="font-mono bg-[#18181b] border border-[#27272a] px-1 py-0.5 rounded text-[9px]">Shift+Enter</kbd> New line
        </span>
        <span className="text-[10px] text-[#52525b]">
          <kbd className="font-mono bg-[#18181b] border border-[#27272a] px-1 py-0.5 rounded text-[9px]">Ctrl+K</kbd> Commands
        </span>
      </div>
    </div>
  );
}
