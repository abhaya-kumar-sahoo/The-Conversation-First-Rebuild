import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Download, Calendar, Activity, CheckCircle, TrendingDown } from 'lucide-react';
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

interface ReportArtifactProps {
  artifact: Artifact;
}

export default function ReportArtifact({ artifact: _artifact }: ReportArtifactProps) {
  const last7 = mockCallMetrics.slice(-7);

  const totalCallsWeek = last7.reduce((sum, d) => sum + d.totalCalls, 0);
  const totalAnsweredWeek = last7.reduce((sum, d) => sum + d.answeredCalls, 0);
  const avgCSATWeek = Math.round(last7.reduce((sum, d) => sum + d.satisfaction, 0) / 7);

  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      {/* Header Actions */}
      <div className="px-5 py-3 border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#52525b]" />
          <span className="text-xs text-[#a1a1aa]">Last 7 Days</span>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30 hover:bg-teal-600 hover:text-white transition-colors text-xs font-medium">
          <Download size={13} />
          Export PDF
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Executive Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: 'Total Calls', value: totalCallsWeek.toLocaleString(), trend: '+5.2%', icon: Activity },
            { label: 'Answer Rate', value: `${Math.round((totalAnsweredWeek / totalCallsWeek) * 100)}%`, trend: '+1.1%', icon: CheckCircle },
            { label: 'Average CSAT', value: `${avgCSATWeek}%`, trend: '-0.4%', icon: TrendingDown, down: true },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#a1a1aa]">{stat.label}</span>
                <stat.icon size={14} className={stat.down ? 'text-red-400' : 'text-emerald-400'} />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className={`text-[10px] mt-1 ${stat.down ? 'text-red-400' : 'text-emerald-400'}`}>
                {stat.trend} vs last week
              </div>
            </div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]"
        >
          <div className="text-sm font-semibold text-white mb-4">Volume Trends</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#52525b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="totalCalls" name="Total Calls" stroke="#0d9488" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tabular Data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#27272a] text-sm font-semibold text-white">
            Daily Breakdown
          </div>
          <table className="w-full text-xs">
            <thead className="bg-[#0f0f12] border-b border-[#27272a]">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-[#71717a]">Date</th>
                <th className="px-4 py-2.5 text-right font-medium text-[#71717a]">Total</th>
                <th className="px-4 py-2.5 text-right font-medium text-[#71717a]">Answered</th>
                <th className="px-4 py-2.5 text-right font-medium text-[#71717a]">CSAT</th>
              </tr>
            </thead>
            <tbody>
              {last7.reverse().map((day, i) => (
                <tr key={i} className="border-b border-[#1e1e23] hover:bg-[#27272a]/50">
                  <td className="px-4 py-2.5 text-[#a1a1aa]">{day.date}</td>
                  <td className="px-4 py-2.5 text-right text-white">{day.totalCalls}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-400">{day.answeredCalls}</td>
                  <td className="px-4 py-2.5 text-right text-teal-400">{day.satisfaction}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
