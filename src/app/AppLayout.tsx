import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/features/conversation/Sidebar';
import { ConversationWorkspace } from '@/features/conversation/ConversationWorkspace';
import { ArtifactPanel } from '@/features/artifacts/ArtifactPanel';
import { useAppSelector, useAppDispatch } from '@/hooks/useStore';
import { toggleCommandPalette, setRightPanelWidth } from '@/store/slices/uiSlice';

export function AppLayout() {
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, rightPanelWidth } = useAppSelector(s => s.ui);
  const { artifacts, activeArtifactId } = useAppSelector(s => s.artifacts);
  const hasArtifacts = artifacts.length > 0;
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(toggleCommandPalette());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  // Resize handler
  const handleResizeStart = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = rightPanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = startX.current - e.clientX;
      dispatch(setRightPanelWidth(startWidth.current + delta));
    };
    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dispatch]);

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#09090b] relative">
      {/* Left Sidebar */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 56 : 260 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="flex-shrink-0 border-r border-[#27272a] overflow-hidden"
        style={{ minWidth: sidebarCollapsed ? 56 : 260 }}
      >
        <Sidebar />
      </motion.div>

      {/* Center Conversation */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <ConversationWorkspace />
      </div>

      {/* Resize Handle */}
      <AnimatePresence>
        {hasArtifacts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="resize-handle"
            onMouseDown={handleResizeStart}
          />
        )}
      </AnimatePresence>

      {/* Right Artifact Panel */}
      <AnimatePresence>
        {hasArtifacts && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: rightPanelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="flex-shrink-0 border-l border-[#27272a] overflow-hidden"
            style={{ width: rightPanelWidth }}
          >
            <ArtifactPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
