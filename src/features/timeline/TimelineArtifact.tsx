import { Activity, PhoneCall, UserPlus, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_EVENTS = [
  { id: 1, type: 'call', title: 'Inbound Call: Tech Support', time: '10:45 AM', user: 'Aman Verma', desc: 'Resolved network issue for ACME Corp.', icon: PhoneCall, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 2, type: 'system', title: 'Queue Configuration Updated', time: '09:30 AM', user: 'System Admin', desc: 'Changed routing strategy to "Least Recent".', icon: Settings, color: 'text-teal-400', bg: 'bg-teal-400/10' },
  { id: 3, type: 'agent', title: 'New Agent Onboarded', time: 'Yesterday', user: 'HR System', desc: 'Priya Sharma joined the Sales Queue.', icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 4, type: 'approval', title: 'Campaign Approved', time: 'Yesterday', user: 'Manager', desc: 'Q3 Outbound Campaign was approved.', icon: CheckCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

export default function TimelineArtifact() {
  return (
    <div className="flex flex-col h-full bg-[#0f0f12] text-[#e4e4e7] p-6 overflow-y-auto relative">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity size={20} className="text-teal-400" />
          Activity Timeline
        </h2>
        <p className="text-xs text-[#71717a] mt-1">Chronological view of workspace events</p>
      </div>

      <div className="relative pl-6">
        {/* Vertical Line */}
        <div className="absolute left-[11px] top-2 bottom-4 w-px bg-[#27272a]"></div>

        <div className="space-y-6">
          {MOCK_EVENTS.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className={`absolute -left-[30px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0f0f12] ${event.bg} ${event.color}`}>
                <event.icon size={10} />
              </div>

              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 ml-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-white">{event.title}</div>
                  <div className="text-[10px] text-[#71717a]">{event.time}</div>
                </div>
                <div className="text-xs text-[#a1a1aa] mb-2">{event.user}</div>
                <div className="text-sm text-[#e4e4e7]">{event.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
