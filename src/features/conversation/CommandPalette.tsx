import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, LayoutDashboard, Users, Phone, BarChart2, FileText, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { setCommandPaletteOpen } from '@/store/slices/uiSlice';
import { sendMessage } from '@/store/slices/conversationSlice';
import { createArtifact } from '@/store/slices/artifactSlice';
import { parseIntent } from '@/services/aiEngine';
import { nanoid } from '@reduxjs/toolkit';
import type { AppDispatch } from '@/store';

const COMMANDS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Show Dashboard', category: 'View', prompt: 'Show me today\'s call center dashboard' },
  { id: 'recordings', icon: Phone, label: 'Show Recordings', category: 'View', prompt: 'Show today\'s call recordings' },
  { id: 'contacts', icon: Users, label: 'Show Contacts', category: 'View', prompt: 'Show all contacts' },
  { id: 'queues', icon: Zap, label: 'Show All Queues', category: 'Queues', prompt: 'Show all call queues' },
  { id: 'create-queue', icon: Zap, label: 'Create Sales Queue', category: 'Queues', prompt: 'Create a Sales queue with Least Recent strategy' },
  { id: 'analytics', icon: BarChart2, label: 'Show Analytics', category: 'Reports', prompt: 'Show analytics and metrics' },
  { id: 'report', icon: BarChart2, label: 'Weekly Report', category: 'Reports', prompt: 'Generate weekly performance report' },
  { id: 'ivr', icon: Zap, label: 'Create IVR Flow', category: 'IVR', prompt: 'Create IVR for customer support' },
  { id: 'sop', icon: FileText, label: 'Write Agent SOP', category: 'Documents', prompt: 'Write onboarding SOP for new agents' },
  { id: 'managers', icon: Users, label: 'Show Managers', category: 'View', prompt: 'Show all managers' },
];

function getArtifactTitle(intentPayload: Record<string, unknown>, type: string): string {
  const titles: Record<string, string> = {
    'queue-editor': `${(intentPayload.name as string) || 'Queue'} Editor`,
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

export function CommandPalette() {
  const dispatch = useAppDispatch<AppDispatch>();
  const { commandPaletteOpen } = useAppSelector(s => s.ui);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter(
    c =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;
      if (e.key === 'Escape') {
        dispatch(setCommandPaletteOpen(false));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selected]) {
          runCommand(filtered[selected].prompt);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, selected, filtered, dispatch]);

  const runCommand = async (prompt: string) => {
    dispatch(setCommandPaletteOpen(false));
    const intent = parseIntent(prompt);
    await dispatch(sendMessage(prompt));
    if (intent.artifactType) {
      dispatch(createArtifact({
        type: intent.artifactType,
        title: getArtifactTitle(intent.payload, intent.artifactType),
        payload: intent.payload,
        conversationId: nanoid(),
      }));
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => dispatch(setCommandPaletteOpen(false))}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="fixed left-1/2 top-[20%] z-50 w-[560px] -translate-x-1/2 rounded-2xl bg-[#18181b] border border-[#27272a] shadow-2xl overflow-hidden"
          >
            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#27272a]">
              <Search size={16} className="text-[#52525b] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Search commands or type a prompt..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#52525b]"
              />
              <button onClick={() => dispatch(setCommandPaletteOpen(false))}>
                <X size={14} className="text-[#52525b] hover:text-white transition-colors" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[#52525b]">
                  No commands found. Press Enter to send as a message.
                </div>
              )}
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => runCommand(cmd.prompt)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selected ? 'bg-violet-600/20 text-white' : 'text-[#a1a1aa] hover:bg-[#27272a]'
                  }`}
                >
                  <cmd.icon size={15} className={i === selected ? 'text-violet-400' : 'text-[#52525b]'} />
                  <span className="text-sm flex-1">{cmd.label}</span>
                  <span className="text-[10px] text-[#52525b] bg-[#27272a] px-2 py-0.5 rounded-full">
                    {cmd.category}
                  </span>
                </button>
              ))}

              {/* Custom prompt option */}
              {query.length > 3 && (
                <button
                  onClick={() => runCommand(query)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-t border-[#27272a] mt-1 pt-2 transition-colors ${
                    selected === filtered.length ? 'bg-violet-600/20 text-white' : 'text-[#71717a] hover:bg-[#27272a]'
                  }`}
                >
                  <Zap size={15} className="text-violet-400" />
                  <span className="text-sm flex-1">Ask AI: <span className="text-white">"{query}"</span></span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[#27272a] bg-[#0f0f12]">
              <span className="text-[10px] text-[#52525b]">
                <kbd className="font-mono bg-[#27272a] px-1 rounded">↑↓</kbd> Navigate
              </span>
              <span className="text-[10px] text-[#52525b]">
                <kbd className="font-mono bg-[#27272a] px-1 rounded">Enter</kbd> Select
              </span>
              <span className="text-[10px] text-[#52525b]">
                <kbd className="font-mono bg-[#27272a] px-1 rounded">Esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
