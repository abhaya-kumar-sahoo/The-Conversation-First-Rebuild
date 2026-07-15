import { Check, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_APPROVALS = [
  { id: 1, type: 'Shift Swap', requester: 'Aman Verma', details: 'Swap morning shift with Priya', status: 'pending', date: '2 hours ago' },
  { id: 2, type: 'Campaign Budget', requester: 'Marketing Team', details: 'Increase Q3 budget by $5,000', status: 'pending', date: '5 hours ago' },
  { id: 3, type: 'Time Off', requester: 'Utkarsh Singh', details: 'Vacation: Aug 12 - Aug 15', status: 'pending', date: '1 day ago' },
];

export default function ApprovalSheet() {
  return (
    <div className="flex flex-col h-full bg-[#0f0f12] text-[#e4e4e7] p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Check size={20} className="text-teal-400" />
          Pending Approvals
        </h2>
        <p className="text-xs text-[#71717a] mt-1">Review and manage requests from your team</p>
      </div>

      <div className="space-y-3">
        {MOCK_APPROVALS.map((approval, idx) => (
          <motion.div
            key={approval.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                <AlertCircle size={18} className="text-teal-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{approval.type}</div>
                <div className="text-xs text-[#a1a1aa] mt-0.5">Requested by <span className="text-[#e4e4e7]">{approval.requester}</span></div>
                <div className="text-[11px] text-[#71717a] mt-1 bg-[#09090b] px-2 py-1 rounded inline-block">
                  {approval.details}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-1 text-[10px] text-[#71717a]">
                <Clock size={10} />
                {approval.date}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a] hover:text-white text-xs font-medium transition-colors">
                  Deny
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-colors">
                  Approve
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
