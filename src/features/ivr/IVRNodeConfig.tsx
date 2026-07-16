import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Music, Save, Trash2, Settings, ListPlus } from 'lucide-react';
import type { Node } from 'reactflow';

interface IVRNodeConfigProps {
  node: Node | null;
  onClose: () => void;
  onSave: (nodeId: string, data: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
}

export function IVRNodeConfig({ node, onClose, onSave, onDelete }: IVRNodeConfigProps) {
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      setMessage(node.data.message || '');
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onSave(node.id, { ...node.data, label, message });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="w-full max-w-lg bg-[#0f0f12] border border-[#27272a] shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
        <h3 className="text-sm font-semibold text-white">Menu Configuration</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Editing Banner */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Music size={14} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                Editing: {node.data.label}
              </div>
              <div className="text-[10px] text-[#71717a]">Make changes to routing and media</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(node.id)}
              className="px-2 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-[10px] font-semibold hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <Trash2 size={10} /> Delete
            </button>
            <button
              onClick={handleSave}
              className="px-2 py-1.5 rounded-lg bg-teal-600 text-white text-[10px] font-semibold hover:bg-teal-700 transition-colors flex items-center gap-1"
            >
              <Save size={10} /> Save
            </button>
          </div>
        </div>

        {/* Menu Settings */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Settings size={14} className="text-teal-400" />
            <h4 className="text-xs font-semibold">Menu Settings</h4>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
              Menu Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-[#0f0f12] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#52525b] outline-none focus:border-teal-500/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
              Message / Notes
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full bg-[#0f0f12] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#52525b] outline-none focus:border-teal-500/50 resize-none"
            />
          </div>
        </div>

        {/* Welcome Greeting (UI Only) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-4 opacity-70">
          <div className="flex items-center gap-2 text-white">
            <Music size={14} className="text-teal-400" />
            <h4 className="text-xs font-semibold">Welcome Greeting</h4>
          </div>
          <div className="bg-[#0f0f12] border border-[#27272a] border-dashed rounded-lg p-3 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center hover:bg-teal-500/30 transition-colors">
                <Play size={12} className="ml-0.5" />
              </button>
              <div>
                <div className="text-xs font-medium text-white">6a4b9a8b097a39d2b...</div>
                <div className="text-[10px] text-teal-400 font-semibold">ACTIVE</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 rounded-lg bg-[#27272a] text-white text-[10px] font-semibold hover:bg-[#3f3f46] transition-colors">
              Choose file
            </button>
            <span className="text-[10px] text-[#71717a]">No file chosen</span>
          </div>
          <button className="w-full py-2 rounded-lg bg-[#0f0f12] border border-[#27272a] text-[#a1a1aa] text-[10px] font-semibold hover:bg-[#27272a] transition-colors text-center">
            Upload Audio
          </button>
        </div>

        {/* Options Routing (UI Only) */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-4 opacity-70 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <ListPlus size={14} className="text-teal-400" />
              <h4 className="text-xs font-semibold">Options Routing</h4>
            </div>
            <button className="px-2 py-1 rounded border border-[#27272a] text-[#a1a1aa] text-[10px] font-semibold hover:bg-[#27272a] transition-colors">
              + Add Option
            </button>
          </div>
          <div className="text-[10px] text-[#71717a]">Define what happens when a caller presses a key</div>
          
          <div className="space-y-2">
            {[
              { key: '1', action: 'Queue', dest: 'sales' },
              { key: '9', action: 'Queue', dest: 'marketing-team' },
            ].map((opt) => (
              <div key={opt.key} className="flex items-center gap-3 bg-[#0f0f12] border border-[#27272a] rounded-lg p-2">
                <div className="w-8 h-8 rounded border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
                  {opt.key}
                </div>
                <div className="text-[#71717a]">→</div>
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-semibold text-[#71717a] uppercase">Action</div>
                  <div className="text-xs text-white bg-[#18181b] border border-[#27272a] rounded px-2 py-1">{opt.action}</div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-semibold text-[#71717a] uppercase">Destination</div>
                  <div className="text-xs text-white bg-[#18181b] border border-[#27272a] rounded px-2 py-1">{opt.dest}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  );
}
