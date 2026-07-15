import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, PinOff, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useStore';
import { setActiveArtifact, pinArtifact, deleteArtifact } from '@/store/slices/artifactSlice';
import { ArtifactRenderer } from './ArtifactRenderer';

const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  'queue-editor': '⚡ Queue Editor',
  'queue-list': '📋 Queue List',
  'ivr-builder': '🔀 IVR Builder',
  'contact-table': '👥 Contacts',
  'manager-table': '🏢 Managers',
  'dashboard': '📊 Dashboard',
  'report': '📈 Report',
  'analytics': '📉 Analytics',
  'editable-document': '📝 Document',
  'recordings': '🎙️ Recordings',
  'confirmation-dialog': '⚠️ Confirm',
  'empty-state': '○ Empty',
};

export function ArtifactPanel() {
  const dispatch = useAppDispatch();
  const { artifacts, activeArtifactId } = useAppSelector(s => s.artifacts);
  const activeArtifact = artifacts.find(a => a.id === activeArtifactId) || artifacts[artifacts.length - 1];
  const activeIndex = artifacts.findIndex(a => a.id === activeArtifact?.id);

  if (!activeArtifact) return null;

  const handlePrev = () => {
    if (activeIndex > 0) dispatch(setActiveArtifact(artifacts[activeIndex - 1].id));
  };
  const handleNext = () => {
    if (activeIndex < artifacts.length - 1) dispatch(setActiveArtifact(artifacts[activeIndex + 1].id));
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f12]">
      {/* Header */}
      <div className="flex flex-col border-b border-[#27272a]">
        {/* Top row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Layers size={14} className="text-[#52525b] flex-shrink-0" />
            <span className="text-xs text-[#71717a]">
              {artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Prev/Next */}
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="w-6 h-6 rounded flex items-center justify-center text-[#52525b] hover:text-white hover:bg-[#27272a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex >= artifacts.length - 1}
              className="w-6 h-6 rounded flex items-center justify-center text-[#52525b] hover:text-white hover:bg-[#27272a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={13} />
            </button>
            {/* Pin */}
            <button
              onClick={() => dispatch(pinArtifact(activeArtifact.id))}
              className="w-6 h-6 rounded flex items-center justify-center text-[#52525b] hover:text-white hover:bg-[#27272a] transition-colors"
              title={activeArtifact.isPinned ? 'Unpin' : 'Pin'}
            >
              {activeArtifact.isPinned ? <PinOff size={13} className="text-violet-400" /> : <Pin size={13} />}
            </button>
            {/* Close */}
            <button
              onClick={() => dispatch(deleteArtifact(activeArtifact.id))}
              className="w-6 h-6 rounded flex items-center justify-center text-[#52525b] hover:text-red-400 hover:bg-[#27272a] transition-colors"
              title="Close artifact (Esc)"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Artifact Tabs */}
        <div className="flex overflow-x-auto px-2 pb-0 gap-0.5">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => dispatch(setActiveArtifact(artifact.id))}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg whitespace-nowrap transition-colors flex-shrink-0 border-b-2 ${artifact.id === activeArtifact.id
                ? 'text-white border-violet-500 bg-[#18181b]'
                : 'text-[#71717a] border-transparent hover:text-white hover:bg-[#18181b]'
                }`}
            >
              {artifact.isPinned && <span className="text-[8px] text-violet-400">●</span>}
              <span>{ARTIFACT_TYPE_LABELS[artifact.type]?.split(' ').slice(1).join(' ') || artifact.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Artifact Title Bar */}
      <div className="px-5 py-3 border-b border-[#27272a] bg-[#18181b]">
        <div className="flex items-center gap-2">
          <span className="text-base">{ARTIFACT_TYPE_LABELS[activeArtifact.type]?.split(' ')[0]}</span>
          <div>
            <h2 className="text-sm font-semibold text-white leading-none">{activeArtifact.title}</h2>
            {activeArtifact.subtitle && (
              <p className="text-xs text-[#71717a] mt-0.5">{activeArtifact.subtitle}</p>
            )}
          </div>
          <div className="ml-auto">
            <span className="text-[10px] text-[#52525b]">
              {new Date(activeArtifact.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArtifact.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-full overflow-y-auto"
          >
            <ArtifactRenderer artifact={activeArtifact} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
