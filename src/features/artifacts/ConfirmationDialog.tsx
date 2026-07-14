import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useStore';
import { deleteArtifact } from '@/store/slices/artifactSlice';
import { addToast } from '@/store/slices/uiSlice';
import { useDeleteQueueMutation } from '@/store/api/apiSlice';
import { nanoid } from '@reduxjs/toolkit';
import type { Artifact } from '@/types';

interface ConfirmationDialogProps {
  artifact: Artifact;
}

export default function ConfirmationDialog({ artifact }: ConfirmationDialogProps) {
  const dispatch = useAppDispatch();
  const [deleteQueue, { isLoading }] = useDeleteQueueMutation();
  const payload = artifact.payload as { queue?: { id: string, name: string } };
  const queue = payload.queue;

  const handleConfirm = async () => {
    if (queue) {
      await deleteQueue(queue.id).unwrap();
      dispatch(addToast({
        id: nanoid(),
        type: 'success',
        title: 'Queue Deleted',
        description: `The queue "${queue.name}" has been permanently deleted.`,
      }));
    }
    dispatch(deleteArtifact(artifact.id));
  };

  const handleCancel = () => {
    dispatch(deleteArtifact(artifact.id));
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full bg-[#18181b] border border-[#27272a] rounded-xl p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Delete Queue?</h3>
        <p className="text-sm text-[#a1a1aa] mb-6">
          Are you sure you want to delete the <strong>{queue?.name || 'selected'}</strong> queue? This action cannot be undone and will unassign all agents.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#27272a] text-sm font-medium text-white hover:bg-[#27272a] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
