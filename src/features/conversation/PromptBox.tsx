import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Sparkles, CornerDownLeft, Command } from 'lucide-react';

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

const SLASH_COMMANDS = [
  { id: 'queue', label: '/queue', desc: 'Create a new queue', query: 'Create a queue' },
  { id: 'campaign', label: '/campaign', desc: 'Build an outbound campaign', query: 'Create an outbound campaign' },
  { id: 'ivr', label: '/ivr', desc: 'Build an IVR flow', query: 'Create IVR flow' },
  { id: 'search', label: '/search', desc: 'Search directory', query: 'Search ' },
  { id: 'approvals', label: '/approvals', desc: 'Show pending approvals', query: 'Show pending approvals' },
  { id: 'timeline', label: '/timeline', desc: 'View activity timeline', query: 'Show timeline' },
];

export function PromptBox({ onSend, isStreaming }: PromptBoxProps) {
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderTyping, setIsPlaceholderTyping] = useState(true);

  // Slash commands state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);

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

  // Refocus input after streaming finishes
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      // Small timeout ensures the disabled attribute is fully removed by React before focusing
      setTimeout(() => textareaRef.current?.focus(), 10);
    }
  }, [isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSlashMenu) {
      const filtered = SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes('/' + slashFilter.toLowerCase()));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[slashIndex]) {
          applySlashCommand(filtered[slashIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const applySlashCommand = (cmd: typeof SLASH_COMMANDS[0]) => {
    setValue(cmd.query);
    setShowSlashMenu(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
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
    const val = e.target.value;
    setValue(val);

    // Check for slash menu
    if (val.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashFilter(val.slice(1));
      setSlashIndex(0);
    } else {
      setShowSlashMenu(false);
    }

    // Auto-grow
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const filteredCommands = SLASH_COMMANDS.filter(c => c.label.toLowerCase().includes('/' + slashFilter.toLowerCase()));

  return (
    <div className="px-6 pb-6 pt-2">
      <motion.div
        className="relative rounded-2xl border border-[#27272a]/80 bg-[#18181b]/60 backdrop-blur-xl shadow-lg shadow-black/40 overflow-hidden"
        //  @ts-ignore
        whileFocusWithin={{ borderColor: 'rgba(124, 58, 237, 0.6)', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.6)' }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {showSlashMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 w-64 mb-2 bg-[#18181b] border border-[#27272a] rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="px-3 py-2 border-b border-[#27272a] bg-[#0f0f12]">
                <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">Slash Commands</span>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      onClick={() => applySlashCommand(cmd)}
                      onMouseEnter={() => setSlashIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${idx === slashIndex ? 'bg-teal-600/20 text-white' : 'text-[#a1a1aa] hover:bg-[#27272a]'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Command size={12} className={idx === slashIndex ? 'text-teal-400' : 'text-[#52525b]'} />
                        <span className="text-[13px] font-medium">{cmd.label}</span>
                      </div>
                      <span className="text-[11px] text-[#71717a]">{cmd.desc}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-xs text-[#71717a]">No commands found</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              title="Attach a file, document, or image to the conversation (Coming soon)"
            >
              <Paperclip size={14} />
            </button>
            {/* Voice (UI only) */}
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-colors"
              title="Use your microphone to speak your prompt (Coming soon)"
            >
              <Mic size={14} />
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#27272a] transition-colors"
              title="View AI suggestions for what you can ask next"
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
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-600 text-white disabled:opacity-30 hover:bg-teal-700 transition-colors disabled:cursor-not-allowed"
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
