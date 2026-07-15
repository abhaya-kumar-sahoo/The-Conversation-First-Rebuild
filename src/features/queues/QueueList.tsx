import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { useGetQueuesQuery } from '@/store/api/apiSlice';
import { useAppDispatch } from '@/hooks/useStore';
import { createArtifact } from '@/store/slices/artifactSlice';
import { nanoid } from '@reduxjs/toolkit';
import type { Artifact, Queue } from '@/types';

const STRATEGY_COLORS: Record<string, string> = {
  'Least Recent': 'text-teal-400 bg-teal-400/10',
  'Ring All': 'text-blue-400 bg-blue-400/10',
  'Round Robin': 'text-emerald-400 bg-emerald-400/10',
  'Fewest Calls': 'text-amber-400 bg-amber-400/10',
  'Random': 'text-pink-400 bg-pink-400/10',
  'Linear Hunt': 'text-cyan-400 bg-cyan-400/10',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-400/10',
  inactive: 'text-[#71717a] bg-[#27272a]',
  paused: 'text-amber-400 bg-amber-400/10',
};

interface QueueListProps {
  artifact: Artifact;
}

export default function QueueList({ artifact: _artifact }: QueueListProps) {
  const dispatch = useAppDispatch();
  const { data: queues = [], isLoading } = useGetQueuesQuery();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return queues.filter(q => {
      const matchSearch = q.name.toLowerCase().includes(search.toLowerCase()) ||
        q.strategy.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [queues, search, statusFilter]);

  const handleOpenEditor = (queue: Queue) => {
    dispatch(createArtifact({
      type: 'queue-editor',
      title: `${queue.name} Editor`,
      payload: { queue, isNew: false },
      conversationId: nanoid(),
    }));
  };

  const handleCreateNew = () => {
    dispatch(createArtifact({
      type: 'queue-editor',
      title: 'New Queue Editor',
      payload: { name: 'New Queue', strategy: 'Least Recent', isNew: true },
      conversationId: nanoid(),
    }));
  };

  if (isLoading) {
    return (
      <div className="p-5 space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-[#27272a] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
          <Search size={13} className="text-[#52525b]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search queues..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#52525b]"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'active', 'paused', 'inactive'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-md text-xs capitalize transition-colors ${statusFilter === s
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
                  : 'text-[#71717a] hover:text-white hover:bg-[#27272a]'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-5 py-2 grid grid-cols-3 gap-3 border-b border-[#27272a]">
        {[
          { label: 'Total Queues', value: queues.length },
          { label: 'Active', value: queues.filter(q => q.status === 'active').length },
          { label: 'Total Agents', value: [...new Set(queues.flatMap(q => q.agents))].length },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-lg font-bold text-white">{stat.value}</div>
            <div className="text-[10px] text-[#52525b]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Queue Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map((queue, i) => (
          <motion.div
            key={queue.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group p-4 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all cursor-pointer"
            onClick={() => handleOpenEditor(queue)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-white">{queue.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[queue.status]}`}>
                    {queue.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${STRATEGY_COLORS[queue.strategy] || 'text-teal-400 bg-teal-400/10'}`}>
                    {queue.strategy}
                  </span>
                  <span className="text-[10px] text-[#52525b]">Ring: {queue.ringTime}s</span>
                  <span className="text-[10px] text-[#52525b]">Wrap-up: {queue.wrapUpTime}s</span>
                  <span className="text-[10px] text-[#52525b]">{queue.agents.length} agents</span>
                </div>
              </div>
              <motion.div
                initial={false}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="text-[10px] text-teal-400 border border-teal-500/30 px-2 py-1 rounded-md group-hover:opacity-100 opacity-0 transition-opacity"
              >
                Edit →
              </motion.div>
            </div>
            {queue.description && (
              <p className="text-[11px] text-[#52525b] mt-2 line-clamp-1">{queue.description}</p>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#52525b]">
            <Filter size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No queues match your filter</p>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 border-t border-[#27272a] bg-[#09090b]">
        <button
          onClick={handleCreateNew}
          className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Create New Queue
        </button>
      </div>
    </div>
  );
}
