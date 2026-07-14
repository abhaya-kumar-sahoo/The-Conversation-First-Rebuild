import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types';
import { Mic, Zap } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  onSuggestionClick: (text: string) => void;
}

function parseMarkdown(text: string): string {
  // First, split the text by double newlines to get blocks (paragraphs, lists, etc)
  const blocks = text.split(/\n\n+/);
  
  return blocks.map(block => {
    // Process formatting within the block
    let parsed = block
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#27272a;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.85em">$1</code>');
      
    // Check if block is a list
    if (/^[-*]\s+/m.test(parsed)) {
      const listItems = parsed.split('\n').map(line => {
        return line.replace(/^[-*]\s+(.+)$/, '<li>$1</li>');
      }).join('');
      return `<ul>${listItems}</ul>`;
    }
    
    // Otherwise it's a regular paragraph
    // Replace remaining single newlines with <br/> for line breaks within a paragraph
    parsed = parsed.replace(/\n/g, '<br/>');
    return `<p>${parsed}</p>`;
  }).join('');
}

export function MessageBubble({ message, onSuggestionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center mt-0.5">
          <Mic size={14} className="text-white" />
        </div>
      )}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center mt-0.5 text-sm font-semibold text-[#a1a1aa]">
          U
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
            isUser
              ? 'bg-violet-600 text-white rounded-tr-sm shadow-violet-900/20'
              : 'bg-[#18181b]/80 backdrop-blur-md border border-[#27272a] text-[#e4e4e7] rounded-tl-sm shadow-black/20'
          }`}
        >
          {message.isStreaming && message.content === '' ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-violet-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-violet-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-violet-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <span
                className="markdown-content inline-block w-full"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
              />
              {message.isStreaming && (
                <span className="typing-cursor" />
              )}
            </div>
          )}
        </div>

        {/* Artifact Badge */}
        {message.artifactType && !message.isStreaming && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-600/15 border border-violet-500/20 text-violet-400 text-xs"
          >
            <Zap size={10} />
            <span>Artifact created</span>
          </motion.div>
        )}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-1.5 max-w-full"
          >
            {message.suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#a1a1aa] border border-[#27272a] bg-[#18181b] hover:border-violet-500/40 hover:text-white hover:bg-[#27272a] transition-all"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-[#52525b]">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
