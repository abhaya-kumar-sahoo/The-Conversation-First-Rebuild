import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Save, Calendar, Users, PhoneCall, TrendingUp } from 'lucide-react';
import type { Artifact, Campaign } from '@/types';

export default function CampaignBuilder({ artifact }: { artifact: Artifact }) {
  const isNew = artifact.payload.isNew as boolean;
  const initialName = artifact.payload.name as string || 'New Campaign';

  const [campaign, setCampaign] = useState<Partial<Campaign>>({
    name: initialName,
    type: 'outbound',
    status: isNew ? 'draft' : 'running',
    targetCalls: 1000,
    startDate: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="flex flex-col h-full bg-[#0f0f12] text-[#e4e4e7] p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-teal-400" />
            Campaign Builder
          </h2>
          <p className="text-xs text-[#71717a] mt-1">Configure automated outbound dialing campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'running' ? (
            <button className="px-3 py-1.5 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-medium flex items-center gap-1 transition-colors">
              <Pause size={12} /> Pause
            </button>
          ) : (
            <button className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1 transition-colors">
              <Play size={12} /> Start
            </button>
          )}
          <button className="px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium flex items-center gap-1 transition-colors">
            <Save size={12} /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Campaign Name</label>
            <input
              value={campaign.name}
              onChange={e => setCampaign({ ...campaign, name: e.target.value })}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Campaign Type</label>
            <select
              value={campaign.type}
              onChange={e => setCampaign({ ...campaign, type: e.target.value as any })}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm focus:border-teal-500 outline-none"
            >
              <option value="outbound">Progressive Dialer</option>
              <option value="predictive">Predictive Dialer</option>
              <option value="preview">Preview Dialer</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5 flex items-center gap-1"><Calendar size={12} /> Start Date</label>
              <input type="date" value={campaign.startDate} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5 flex items-center gap-1"><PhoneCall size={12} /> Target Calls</label>
              <input type="number" value={campaign.targetCalls} className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Users size={16} className="text-teal-400" /> Target Audience
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-[#27272a] bg-[#09090b]">
              <input type="radio" name="audience" defaultChecked className="accent-teal-500" />
              <div>
                <div className="text-sm font-medium">Lead List (CSV)</div>
                <div className="text-[10px] text-[#71717a]">Upload a custom list of contacts</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-[#27272a] bg-[#09090b]">
              <input type="radio" name="audience" className="accent-teal-500" />
              <div>
                <div className="text-sm font-medium">CRM Segment</div>
                <div className="text-[10px] text-[#71717a]">Connect to Salesforce or HubSpot</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
