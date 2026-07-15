import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  BackgroundVariant,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import { X } from 'lucide-react';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import type { Artifact } from '@/types';

// ============================================================
// Custom Node Components
// ============================================================

const nodeStyles = {
  base: 'rounded-xl border text-xs font-medium px-4 py-3 min-w-[140px] shadow-lg',
  colors: {
    'ivr-start': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    'ivr-menu': 'bg-teal-500/20 border-teal-500/40 text-teal-300',
    'ivr-playback': 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    'ivr-queue': 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    'ivr-transfer': 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    'ivr-voicemail': 'bg-pink-500/20 border-pink-500/40 text-pink-300',
    'ivr-hangup': 'bg-red-500/20 border-red-500/40 text-red-300',
  } as Record<string, string>,
  icons: {
    'ivr-start': '▶',
    'ivr-menu': '☰',
    'ivr-playback': '🔊',
    'ivr-queue': '⏱',
    'ivr-transfer': '↗',
    'ivr-voicemail': '📧',
    'ivr-hangup': '✕',
  } as Record<string, string>,
};

function IVRNode({ id, data }: { id: string; data: { label: string; type: string; message?: string } }) {
  const { setNodes } = useReactFlow();
  const colorClass = nodeStyles.colors[data.type] || 'bg-[#27272a] border-[#3f3f46] text-[#a1a1aa]';
  const icon = nodeStyles.icons[data.type] || '○';
  
  // Hide top target handle for "start" nodes, since nothing connects TO a start node
  const isStart = data.type === 'ivr-start';

  return (
    <div className={`${nodeStyles.base} ${colorClass}`}>
      {!isStart && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="!bg-[#71717a] !w-2.5 !h-2.5 !border-0" 
        />
      )}
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-semibold">{data.label}</span>
        </div>
        {!isStart && (
          <button 
            onClick={() => setNodes(nds => nds.filter(n => n.id !== id))}
            className="w-4 h-4 rounded flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-black/20 transition-all"
            title="Delete Node"
          >
            <X size={10} />
          </button>
        )}
      </div>
      {data.message && (
        <p className="mt-1 text-[10px] opacity-70 truncate max-w-[140px]">{data.message}</p>
      )}

      {/* Hide bottom source handle for "hangup" nodes, since nothing connects FROM a hangup node */}
      {data.type !== 'ivr-hangup' && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!bg-[#71717a] !w-2.5 !h-2.5 !border-0" 
        />
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  ivrNode: IVRNode,
};

// ============================================================
// Initial Nodes per IVR type
// ============================================================

function getInitialFlow(name: string) {
  const isSales = /sales/i.test(name);
  const isBilling = /billing/i.test(name);

  const nodes = [
    {
      id: '1',
      type: 'ivrNode',
      position: { x: 250, y: 20 },
      data: { label: 'Start', type: 'ivr-start', message: 'Call received' },
    },
    {
      id: '2',
      type: 'ivrNode',
      position: { x: 250, y: 130 },
      data: { label: 'Welcome', type: 'ivr-playback', message: `Thank you for calling ${name}` },
    },
    {
      id: '3',
      type: 'ivrNode',
      position: { x: 250, y: 240 },
      data: { label: 'Main Menu', type: 'ivr-menu', message: 'Press 1 for Sales, 2 for Support, 3 for Billing' },
    },
    {
      id: '4',
      type: 'ivrNode',
      position: { x: 60, y: 370 },
      data: { label: isSales ? 'Sales Queue' : 'Support Queue', type: 'ivr-queue', message: 'Routing to agent...' },
    },
    {
      id: '5',
      type: 'ivrNode',
      position: { x: 250, y: 370 },
      data: { label: isBilling ? 'Billing Queue' : 'Tech Support', type: 'ivr-queue', message: 'Routing to specialist...' },
    },
    {
      id: '6',
      type: 'ivrNode',
      position: { x: 440, y: 370 },
      data: { label: 'Voicemail', type: 'ivr-voicemail', message: 'Leave a message after the tone' },
    },
    {
      id: '7',
      type: 'ivrNode',
      position: { x: 250, y: 490 },
      data: { label: 'Hang Up', type: 'ivr-hangup' },
    },
  ];

  const edges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#0d9488' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#0d9488' } },
    { id: 'e3-4', source: '3', target: '4', label: 'Press 1', labelStyle: { fill: '#a1a1aa', fontSize: 10 } },
    { id: 'e3-5', source: '3', target: '5', label: 'Press 2', labelStyle: { fill: '#a1a1aa', fontSize: 10 } },
    { id: 'e3-6', source: '3', target: '6', label: 'No input', labelStyle: { fill: '#a1a1aa', fontSize: 10 } },
    { id: 'e6-7', source: '6', target: '7', style: { stroke: '#ef4444' } },
  ];

  return { nodes, edges };
}

// ============================================================
// Available Node Types Panel
// ============================================================

const NODE_PALETTE = [
  { type: 'ivr-menu', label: 'Menu', icon: '☰' },
  { type: 'ivr-playback', label: 'Playback', icon: '🔊' },
  { type: 'ivr-queue', label: 'Queue', icon: '⏱' },
  { type: 'ivr-transfer', label: 'Transfer', icon: '↗' },
  { type: 'ivr-voicemail', label: 'Voicemail', icon: '📧' },
  { type: 'ivr-hangup', label: 'Hang Up', icon: '✕' },
];

interface IVRBuilderProps {
  artifact: Artifact;
}

export default function IVRBuilder({ artifact }: IVRBuilderProps) {
  const payload = artifact.payload as { name?: string };
  const ivrName = payload.name || 'Customer Support';
  const { nodes: initNodes, edges: initEdges } = getInitialFlow(ivrName);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [nodeCount, setNodeCount] = useState(initNodes.length);

  const onConnect = useCallback(
    (connection: Connection) => setEdges(eds => addEdge({ ...connection, animated: true, style: { stroke: '#0d9488' } }, eds)),
    [setEdges]
  );

  const addNode = (type: string, label: string) => {
    const id = `node-${nodeCount + 1}`;
    setNodes(nds => [
      ...nds,
      {
        id,
        type: 'ivrNode',
        position: { x: 100 + Math.random() * 300, y: 200 + Math.random() * 200 },
        data: { label, type, message: '' },
      },
    ]);
    setNodeCount(c => c + 1);
  };

  return (
    <div className="flex h-full">
      {/* Node Palette */}
      <div className="w-36 flex-shrink-0 border-r border-[#27272a] bg-[#0f0f12] p-3 flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-[#52525b] uppercase tracking-wider mb-1">Add Node</p>
        {NODE_PALETTE.map(node => (
          <motion.button
            key={node.type}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => addNode(node.type, node.label)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors ${nodeStyles.colors[node.type] || 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]'}`}
          >
            <span>{node.icon}</span>
            <span>{node.label}</span>
          </motion.button>
        ))}
        <div className="mt-auto text-[9px] text-[#52525b] leading-relaxed">
          Drag nodes to connect. Double-click to edit.
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: '#09090b' }}
        >
          <Background color="#27272a" gap={20} variant={BackgroundVariant.Dots} />
          <Controls
            style={{
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: 8,
            }}
          />
          <MiniMap
            style={{
              background: '#0f0f12',
              border: '1px solid #27272a',
              borderRadius: 8,
            }}
            nodeColor="#0d9488"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
