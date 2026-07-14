import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Pin, Clock, Bookmark, Zap, Settings,
  ChevronLeft, ChevronRight, Plus, LayoutDashboard,
  Phone, Users, FileText, BarChart2, Mic, Search
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useStore';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { clearMessages } from '@/store/slices/conversationSlice';
import { clearAllArtifacts } from '@/store/slices/artifactSlice';
import { sendMessage } from '@/store/slices/conversationSlice';
import { mockSavedPrompts } from '@/utils/mockData';
import type { AppDispatch } from '@/store';

const QUICK_ACTIONS = [
  { icon: LayoutDashboard, label: 'Dashboard', prompt: 'Show me today\'s call center dashboard' },
  { icon: Phone, label: 'Recordings', prompt: 'Show today\'s call recordings' },
  { icon: Users, label: 'Agents', prompt: 'Show all agents' },
  { icon: Zap, label: 'Create Queue', prompt: 'Create a new Sales queue with Least Recent strategy' },
  { icon: BarChart2, label: 'Analytics', prompt: 'Show analytics and metrics' },
  { icon: FileText, label: 'SOP', prompt: 'Write onboarding SOP for new agents' },
];

const RECENT_ACTIVITIES = [
  { label: 'Sales Queue updated', time: '2m ago', icon: '⚡' },
  { label: 'IVR flow created', time: '15m ago', icon: '🔀' },
  { label: 'Weekly report generated', time: '1h ago', icon: '📊' },
  { label: 'Aman assigned to Support', time: '3h ago', icon: '👤' },
];

const CONVERSATION_HISTORY = [
  { id: '1', label: 'Sales queue optimization', time: 'Today' },
  { id: '2', label: 'Q3 performance report', time: 'Today' },
  { id: '3', label: 'IVR flow redesign', time: 'Yesterday' },
  { id: '4', label: 'Agent schedule review', time: 'Yesterday' },
  { id: '5', label: 'Billing queue setup', time: 'Jun 12' },
];

export function Sidebar() {
  const dispatch = useAppDispatch<AppDispatch>();
  const { sidebarCollapsed } = useAppSelector(s => s.ui);
  const [activeSection, setActiveSection] = useState<string>('history');

  const handleNewConversation = () => {
    dispatch(clearMessages());
    dispatch(clearAllArtifacts());
  };

  const handleQuickAction = (prompt: string) => {
    dispatch(sendMessage(prompt) as Parameters<typeof dispatch>[0]);
  };

  const collapsed = sidebarCollapsed;

  return (
    <div className="h-full flex flex-col bg-[#0f0f12]">
      {/* Logo + Collapse */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-4'} py-4 border-b border-[#27272a]`}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Mic size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white leading-none">CallCenter</div>
                <div className="text-[10px] text-[#71717a] leading-none mt-0.5">AI Workspace</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* New Conversation */}
      <div className={`${collapsed ? 'px-3 py-3' : 'px-3 py-3'}`}>
        <button
          onClick={handleNewConversation}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors`}
        >
          <Plus size={14} />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap "
              >
                New Conversation
              </motion.span >
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[#71717a]">
            <Search size={13} />
            <span className="text-xs">Search workspace...</span>
            <span className="ml-auto text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded font-mono">⌘K</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {!collapsed && (
        <div className="px-2.5 flex gap-1 mb-2">
          {[
            { id: 'history', icon: MessageSquare, label: 'History' },
            { id: 'quick', icon: Zap, label: 'Quick' },
            { id: 'saved', icon: Bookmark, label: 'Saved' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-colors ${activeSection === tab.id
                ? 'bg-[#27272a] text-white shadow-sm'
                : 'text-[#71717a] hover:text-white hover:bg-[#18181b]'
                }`}
            >
              <tab.icon size={11} className="flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2">
        <AnimatePresence mode="wait">
          {!collapsed && activeSection === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0.5"
            >
              <div className="px-2 py-1.5 text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">
                Today
              </div>
              {CONVERSATION_HISTORY.filter(c => c.time === 'Today').map(conv => (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors text-left group"
                >
                  <MessageSquare size={13} className="flex-shrink-0 text-[#52525b]" />
                  <span className="text-xs truncate">{conv.label}</span>
                  <Pin size={11} className="ml-auto opacity-0 group-hover:opacity-100 text-[#52525b] flex-shrink-0" />
                </button>
              ))}
              <div className="px-2 py-1.5 text-[10px] font-semibold text-[#52525b] uppercase tracking-wider mt-2">
                Yesterday
              </div>
              {CONVERSATION_HISTORY.filter(c => c.time === 'Yesterday').map(conv => (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors text-left"
                >
                  <MessageSquare size={13} className="flex-shrink-0 text-[#52525b]" />
                  <span className="text-xs truncate">{conv.label}</span>
                </button>
              ))}
              <div className="px-2 py-1.5 text-[10px] font-semibold text-[#52525b] uppercase tracking-wider mt-2">
                Older
              </div>
              {CONVERSATION_HISTORY.filter(c => c.time !== 'Today' && c.time !== 'Yesterday').map(conv => (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors text-left"
                >
                  <MessageSquare size={13} className="flex-shrink-0 text-[#52525b]" />
                  <span className="text-xs truncate">{conv.label}</span>
                </button>
              ))}
            </motion.div>
          )}

          {!collapsed && activeSection === 'quick' && (
            <motion.div
              key="quick"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0.5"
            >
              <div className="px-2 py-1.5 text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">
                Quick Actions
              </div>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors text-left"
                >
                  <action.icon size={13} className="flex-shrink-0 text-violet-400" />
                  <span className="text-xs">{action.label}</span>
                </button>
              ))}

              <div className="px-2 py-1.5 text-[10px] font-semibold text-[#52525b] uppercase tracking-wider mt-2">
                Recent Activity
              </div>
              {RECENT_ACTIVITIES.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-[#71717a]"
                >
                  <span className="text-sm">{activity.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-[#a1a1aa] truncate">{activity.label}</div>
                    <div className="text-[10px] text-[#52525b]">{activity.time}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {!collapsed && activeSection === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0.5"
            >
              <div className="px-2 py-1.5 text-[10px] font-semibold text-[#52525b] uppercase tracking-wider">
                Saved Prompts
              </div>
              {mockSavedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleQuickAction(prompt.prompt)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#18181b] transition-colors text-left"
                >
                  <Bookmark size={12} className="flex-shrink-0 text-[#52525b]" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate">{prompt.label}</div>
                    <div className="text-[10px] text-[#52525b]">{prompt.category}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Collapsed: show icon-only quick actions */}
          {collapsed && (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1 pt-2"
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  title={action.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#18181b] transition-colors"
                >
                  <action.icon size={15} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className={`border-t border-[#27272a] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <button className={`flex items-center gap-2 ${collapsed ? 'w-9 h-9 justify-center' : 'w-full px-2 py-2'} rounded-lg text-[#71717a] hover:text-white hover:bg-[#18181b] transition-colors`}>
          <Settings size={14} />
          {!collapsed && <span className="text-xs">Settings</span>}
        </button>
      </div>
    </div>
  );
}
