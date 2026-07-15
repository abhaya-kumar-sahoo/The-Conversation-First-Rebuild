import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Calendar } from 'lucide-react';
import { mockCallMetrics } from '@/utils/mockData';
import type { Artifact } from '@/types';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[10px] text-[#52525b] mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-medium" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

interface AnalyticsArtifactProps {
  artifact: Artifact;
}

export default function AnalyticsArtifact({ artifact: _artifact }: AnalyticsArtifactProps) {
  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      {/* Header Actions */}
      <div className="px-5 py-3 border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#52525b]" />
          <span className="text-xs text-[#a1a1aa]">Last 14 Days Analytics</span>
        </div>

      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* Metric Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-4"
        >
          {[
            { label: 'Avg Handle Time', value: '312s', trend: '-12s' },
            { label: 'Avg Wait Time', value: '45s', trend: '+3s' },
            { label: 'Abandon Rate', value: '4.2%', trend: '-0.8%' },
            { label: 'Service Level', value: '91%', trend: '+2%' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
              <div className="text-xs text-[#a1a1aa] mb-1">{stat.label}</div>
              <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
              <div className={`text-[10px] ${stat.trend.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stat.trend} vs previous
              </div>
            </div>
          ))}
        </motion.div>

        {/* Handle Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]"
        >
          <div className="text-sm font-semibold text-white mb-4">Average Handle Time (AHT) vs Wait Time</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockCallMetrics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#52525b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
              <Line type="monotone" dataKey="avgHandleTime" name="Handle Time (s)" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, fill: '#0d9488' }} />
              <Line type="monotone" dataKey="avgWaitTime" name="Wait Time (s)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* FCR Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]"
        >
          <div className="text-sm font-semibold text-white mb-4">First Call Resolution (FCR) %</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockCallMetrics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#52525b', fontSize: 10 }} domain={[50, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="firstCallResolution" name="FCR %" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
}
