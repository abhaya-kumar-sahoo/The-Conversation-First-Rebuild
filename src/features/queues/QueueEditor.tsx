import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, CheckCircle, Clock, Users, Activity } from 'lucide-react';
import { useGetAgentsQuery } from '@/store/api/apiSlice';
import { useAppDispatch } from '@/hooks/useStore';
import { updateArtifact } from '@/store/slices/artifactSlice';
import { addToast } from '@/store/slices/uiSlice';
import { nanoid } from '@reduxjs/toolkit';
import type { Artifact, QueueStrategy } from '@/types';
import { mockQueues } from '@/utils/mockData';

const queueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  strategy: z.enum(['Least Recent', 'Ring All', 'Round Robin', 'Fewest Calls', 'Random', 'Linear Hunt']),
  ringTime: z.coerce.number().min(5).max(120),
  wrapUpTime: z.coerce.number().min(0).max(300),
  maxWaitTime: z.coerce.number().min(10).max(600),
  status: z.enum(['active', 'inactive', 'paused']),
  description: z.string().optional(),
  agents: z.array(z.string()).default([]),
});

type QueueFormValues = z.infer<typeof queueSchema>;

const STRATEGIES: QueueStrategy[] = [
  'Least Recent', 'Ring All', 'Round Robin', 'Fewest Calls', 'Random', 'Linear Hunt'
];

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-400/10',
  inactive: 'text-[#71717a] bg-[#27272a]',
  paused: 'text-amber-400 bg-amber-400/10',
};

const ACTIVITY_TIMELINE = [
  { event: 'Queue created', time: '3 months ago', icon: CheckCircle },
  { event: 'Strategy changed to Least Recent', time: '2 months ago', icon: Activity },
  { event: 'Aman Verma assigned', time: '1 month ago', icon: Users },
  { event: 'Ring time updated to 30s', time: '2 weeks ago', icon: Clock },
  { event: 'Utkarsh Singh assigned', time: '1 week ago', icon: Users },
];

interface QueueEditorProps {
  artifact: Artifact;
}

export default function QueueEditor({ artifact }: QueueEditorProps) {
  const dispatch = useAppDispatch();
  const { data: agents = [], isLoading: agentsLoading } = useGetAgentsQuery();
  const [saved, setSaved] = useState(false);

  const payload = artifact.payload as Record<string, unknown>;
  const existingQueue = payload.queue as typeof mockQueues[0] | undefined;
  const preloadedAgents = payload.agentIds as string[] | undefined;

  const defaultValues: QueueFormValues = {
    name: (payload.name as string) || existingQueue?.name || 'New Queue',
    strategy: ((payload.strategy as QueueStrategy) || existingQueue?.strategy || 'Least Recent'),
    ringTime: (payload.ringTime as number) || existingQueue?.ringTime || 30,
    wrapUpTime: (payload.wrapUpTime as number) || existingQueue?.wrapUpTime || 60,
    maxWaitTime: (payload.maxWaitTime as number) || existingQueue?.maxWaitTime || 120,
    status: (payload.status as 'active' | 'inactive' | 'paused') || existingQueue?.status || 'active',
    description: (existingQueue?.description) || '',
    agents: preloadedAgents?.length ? preloadedAgents : (existingQueue?.agents || []),
  };

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<QueueFormValues>({
    resolver: zodResolver(queueSchema),
    defaultValues,
  });

  const watchedAgents = watch('agents');
  const watchedStatus = watch('status');

  const toggleAgent = (agentId: string) => {
    if (watchedAgents.includes(agentId)) {
      setValue('agents', watchedAgents.filter(id => id !== agentId), { shouldDirty: true });
    } else {
      setValue('agents', [...watchedAgents, agentId], { shouldDirty: true });
    }
  };

  const onSubmit = (values: QueueFormValues) => {
    dispatch(updateArtifact({ id: artifact.id, payload: { payload: { ...payload, ...values } } }));
    dispatch(addToast({ id: nanoid(), type: 'success', title: 'Queue saved', description: `${values.name} queue has been updated` }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        {/* Form Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Queue Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa]">Queue Name</label>
            <input
              {...register('name')}
              className="w-full px-3 py-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-white text-sm outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-colors"
              placeholder="e.g., Sales Queue"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          {/* Strategy */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa]">Routing Strategy</label>
            <Controller
              name="strategy"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {STRATEGIES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => field.onChange(s)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${field.value === s
                        ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                        : 'border-[#27272a] bg-[#18181b] text-[#71717a] hover:border-[#3f3f46] hover:text-white'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Timing Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'ringTime' as const, label: 'Ring Time', unit: 'sec' },
              { key: 'wrapUpTime' as const, label: 'Wrap-up Time', unit: 'sec' },
              { key: 'maxWaitTime' as const, label: 'Max Wait', unit: 'sec' },
            ].map(({ key, label, unit }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-[#a1a1aa]">{label}</label>
                <div className="relative">
                  <input
                    {...register(key)}
                    type="number"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[#18181b] border border-[#27272a] text-white text-sm outline-none focus:border-teal-500/50 transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#52525b]">{unit}</span>
                </div>
                {errors[key] && <p className="text-[10px] text-red-400">{errors[key]?.message}</p>}
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa]">Status</label>
            <div className="flex gap-2">
              {(['active', 'paused', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setValue('status', s, { shouldDirty: true })}
                  className={`px-4 py-2 rounded-lg border text-xs font-medium capitalize transition-all ${watchedStatus === s
                    ? `${STATUS_COLORS[s]} border-current`
                    : 'border-[#27272a] bg-[#18181b] text-[#71717a] hover:text-white'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa]">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-white text-sm outline-none focus:border-teal-500/50 resize-none transition-colors"
              placeholder="Optional queue description..."
            />
          </div>

          {/* Agent Assignment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#a1a1aa]">Assigned Agents</label>
              <span className="text-xs text-[#52525b]">{watchedAgents.length} selected</span>
            </div>
            {agentsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="shimmer h-12 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {agents.map(agent => {
                  const selected = watchedAgents.includes(agent.id);
                  const statusColors: Record<string, string> = {
                    online: 'bg-emerald-400',
                    busy: 'bg-amber-400',
                    break: 'bg-blue-400',
                    offline: 'bg-[#52525b]',
                  };
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => toggleAgent(agent.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${selected
                        ? 'border-teal-500/40 bg-teal-500/8 text-white'
                        : 'border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-white'
                        }`}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-xs font-semibold">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#18181b] ${statusColors[agent.status]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{agent.name}</div>
                        <div className="text-[10px] text-[#52525b] truncate">{agent.department} · Ext {agent.extension}</div>
                      </div>
                      {selected && <CheckCircle size={14} className="text-teal-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#a1a1aa]">Activity Timeline</label>
            <div className="relative pl-4 space-y-3">
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#27272a]" />
              {ACTIVITY_TIMELINE.map((item, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="absolute -left-4 top-0.5 w-3 h-3 rounded-full bg-[#09090b] border border-[#27272a] flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  </div>
                  <div>
                    <div className="text-xs text-[#a1a1aa]">{item.event}</div>
                    <div className="text-[10px] text-[#52525b]">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-[#27272a] flex items-center gap-2">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${saved
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
          >
            {saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saved ? 'Saved!' : isDirty ? 'Save Changes' : 'Save Queue'}
          </motion.button>
          <button
            type="button"
            className="px-4 py-2.5 rounded-lg border border-[#27272a] text-sm text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors flex items-center gap-1.5"
          >
            <X size={13} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
