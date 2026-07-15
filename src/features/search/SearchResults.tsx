import { Search, User, Phone, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Artifact } from '@/types';

export default function SearchResults({ artifact }: { artifact: Artifact }) {
  const query = artifact.payload.query as string || '';

  const RESULTS = [
    { id: 1, type: 'Contact', name: 'Aman Verma', desc: 'Customer Success Manager at Acme', icon: User, match: query || 'Aman' },
    { id: 2, type: 'Agent', name: 'Priya Sharma', desc: 'Support Agent (Tier 2)', icon: Briefcase, match: query || 'Sharma' },
    { id: 3, type: 'Recording', name: 'Call with Acme Corp', desc: 'Duration: 12:45 • Positive Sentiment', icon: Phone, match: query || 'Acme' },
  ];

  const filteredResults = query
    ? RESULTS.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.desc.toLowerCase().includes(query.toLowerCase()) ||
          r.type.toLowerCase().includes(query.toLowerCase())
      )
    : RESULTS;

  return (
    <div className="flex flex-col h-full bg-[#0f0f12] text-[#e4e4e7] p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Search size={20} className="text-violet-400" />
          Search Results
        </h2>
        <p className="text-sm text-[#a1a1aa] mt-2">
          Found {filteredResults.length} results for <span className="text-white font-medium">"{query}"</span>
        </p>
      </div>

      <div className="space-y-3">
        {filteredResults.map((res, idx) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-4 p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center text-[#a1a1aa]">
              <res.icon size={18} />
            </div>
            <div>
              <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">{res.type}</div>
              <div className="text-sm font-medium text-white">{res.name}</div>
              <div className="text-xs text-[#a1a1aa] mt-0.5">{res.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
