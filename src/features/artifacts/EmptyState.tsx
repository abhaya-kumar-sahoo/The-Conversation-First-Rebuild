import { BoxSelect } from 'lucide-react';
import type { Artifact } from '@/types';

interface EmptyStateProps {
  artifact: Artifact;
}

export default function EmptyState({ artifact: _artifact }: EmptyStateProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center text-[#71717a]">
      <div className="w-16 h-16 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4">
        <BoxSelect size={24} className="text-[#52525b]" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">Nothing to show</h3>
      <p className="text-xs">Select an item from the list to view its details.</p>
    </div>
  );
}
