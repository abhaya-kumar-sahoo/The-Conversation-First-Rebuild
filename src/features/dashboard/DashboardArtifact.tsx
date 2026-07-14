import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Phone, Users, Clock, TrendingUp, TrendingDown, Activity, Star, Zap } from 'lucide-react';
import { mockDashboardStats, mockCallMetrics, mockAgents } from '@/utils/mockData';
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

const STAT_CARDS = [
  {
    label: 'Total Calls Today',
    value: mockDashboardStats.totalCallsToday.toLocaleString(),
    change: '+12.3%',
    positive: true,
    icon: Phone,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    label: 'Agents Available',
    value: `${mockDashboardStats.agentsAvailable}/${mockDashboardStats.agentsAvailable + mockDashboardStats.agentsBusy}`,
    change: '6 online',
    positive: true,
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    label: 'Avg Wait Time',
    value: `${mockDashboardStats.avgWaitTime}s`,
    change: '-8.1%',
    positive: true,
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    label: 'CSAT Score',
    value: `${mockDashboardStats.satisfactionScore}%`,
    change: '+2.1%',
    positive: true,
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
];

interface DashboardArtifactProps {
  artifact: Artifact;
}

export default function DashboardArtifact({ artifact: _artifact }: DashboardArtifactProps) {
  const last7 = mockCallMetrics.slice(-7);

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={15} className={stat.color} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-medium ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-[10px] text-[#52525b]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Live Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-3 rounded-xl bg-[#18181b] border border-[#27272a]"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-white">Live Status</span>
          </div>
          <span className="text-[10px] text-[#52525b]">{mockDashboardStats.callsInQueue} in queue</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'In Queue', value: mockDashboardStats.callsInQueue, color: 'text-amber-400' },
            { label: 'On Call', value: mockDashboardStats.agentsBusy, color: 'text-blue-400' },
            { label: 'Missed', value: mockDashboardStats.missedCallsToday, color: 'text-red-400' },
            { label: 'FCR', value: `${mockDashboardStats.firstCallResolution}%`, color: 'text-emerald-400' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              <div className="text-[9px] text-[#52525b]">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Call Volume Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white">Call Volume (7 Days)</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1 text-[10px] text-[#52525b]">
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" /> Total
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#52525b]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Answered
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={last7} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="answeredGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fill: '#52525b', fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="totalCalls" name="Total" stroke="#7c3aed" fill="url(#totalGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="answeredCalls" name="Answered" stroke="#22c55e" fill="url(#answeredGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Agent Performance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white">Agent Performance</span>
          <Activity size={13} className="text-[#52525b]" />
        </div>
        <div className="space-y-2.5">
          {mockAgents.slice(0, 5).map((agent) => (
            <div key={agent.id} className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-[#27272a] flex items-center justify-center text-[9px] font-semibold text-[#a1a1aa]">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#18181b] ${
                  agent.status === 'online' ? 'bg-emerald-400' :
                  agent.status === 'busy' ? 'bg-amber-400' :
                  agent.status === 'break' ? 'bg-blue-400' : 'bg-[#52525b]'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-[#a1a1aa] truncate">{agent.name}</span>
                  <span className="text-[9px] text-[#52525b] ml-1">{agent.satisfaction}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-[#27272a]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.satisfaction}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-full rounded-full bg-violet-500"
                  />
                </div>
              </div>
              <span className="text-[9px] text-[#52525b] flex-shrink-0">{agent.callsHandled.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Queue Performance Bar Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-xl bg-[#18181b] border border-[#27272a]"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white">CSAT by Day</span>
          <Zap size={13} className="text-violet-400" />
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={last7.slice(-7)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fill: '#52525b', fontSize: 9 }} domain={[70, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="satisfaction" name="CSAT" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
