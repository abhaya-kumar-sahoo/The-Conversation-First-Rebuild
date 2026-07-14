import type { ParsedIntent, IntentType, ArtifactType } from '@/types';
import { mockAgents, mockQueues } from '@/utils/mockData';

// ============================================================
// INTENT PATTERNS
// ============================================================

interface IntentPattern {
  type: IntentType;
  patterns: RegExp[];
  artifactType: ArtifactType | null;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    type: 'create-queue',
    patterns: [/\bcreate\b.*\bqueue\b/i, /\bnew\b.*\bqueue\b/i, /\badd\b.*\bqueue\b/i, /\bset up\b.*\bqueue\b/i],
    artifactType: 'queue-editor',
  },
  {
    type: 'edit-queue',
    patterns: [/\bedit\b.*\bqueue\b/i, /\bupdate\b.*\bqueue\b/i, /\bmodify\b.*\bqueue\b/i, /\bchange\b.*\bqueue\b/i],
    artifactType: 'queue-editor',
  },
  {
    type: 'delete-queue',
    patterns: [/\bdelete\b.*\bqueue\b/i, /\bremove\b.*\bqueue\b/i, /\bdisable\b.*\bqueue\b/i],
    artifactType: 'confirmation-dialog',
  },
  {
    type: 'show-queues',
    patterns: [/\bshow\b.*\bqueue/i, /\blist\b.*\bqueue/i, /\ball queue/i, /\bview\b.*\bqueue/i, /\bqueue\b.*\blist/i],
    artifactType: 'queue-list',
  },
  {
    type: 'assign-agents',
    patterns: [/\bassign\b.*\bagent/i, /\badd\b.*\bagent/i, /\bput\b.*\bagent/i],
    artifactType: 'queue-editor',
  },
  {
    type: 'unassign-agents',
    patterns: [/\bunassign\b.*\bagent/i, /\bremove\b.*\bagent/i],
    artifactType: 'queue-editor',
  },
  {
    type: 'create-ivr',
    patterns: [/\bcreate\b.*\bivr/i, /\bnew\b.*\bivr/i, /\bbuild\b.*\bivr/i, /\bivr\b.*\bflow/i, /\binteractive voice/i],
    artifactType: 'ivr-builder',
  },
  {
    type: 'edit-ivr',
    patterns: [/\bedit\b.*\bivr/i, /\bupdate\b.*\bivr/i, /\bmodify\b.*\bivr/i],
    artifactType: 'ivr-builder',
  },
  {
    type: 'show-contacts',
    patterns: [/\bshow\b.*\bcontact/i, /\blist\b.*\bcontact/i, /\ball contact/i, /\bview\b.*\bcontact/i, /\bcontact\b.*\blist/i, /\bshow\b.*\bagent/i, /\ball agent/i, /\blist\b.*\bagent/i],
    artifactType: 'contact-table',
  },
  {
    type: 'show-managers',
    patterns: [/\bshow\b.*\bmanager/i, /\blist\b.*\bmanager/i, /\ball manager/i, /\bmanager\b.*\blist/i],
    artifactType: 'manager-table',
  },
  {
    type: 'show-dashboard',
    patterns: [/\bdashboard/i, /\boverview/i, /\btoday.*stat/i, /\blive.*metric/i, /\bkpi/i, /\bperformance.*overview/i],
    artifactType: 'dashboard',
  },
  {
    type: 'show-recordings',
    patterns: [/\brecording/i, /\bcall.*record/i, /\brecorded.*call/i],
    artifactType: 'recordings',
  },
  {
    type: 'generate-report',
    patterns: [/\breport/i, /\bweekly\b/i, /\bmonthly\b/i, /\bgenerate.*report/i, /\bperformance.*report/i, /\bsummary/i],
    artifactType: 'report',
  },
  {
    type: 'show-analytics',
    patterns: [/\banalytics/i, /\banalyse/i, /\banalyze/i, /\bmetrics/i, /\bstats/i, /\bstatistics/i, /\bcall.*volume/i, /\btrend/i],
    artifactType: 'analytics',
  },
  {
    type: 'generate-document',
    patterns: [/\bwrite\b/i, /\bdocument/i, /\bsop\b/i, /\bprocedure/i, /\bpolicy\b/i, /\bguide\b/i, /\bplaybook\b/i, /\bonboarding/i, /\bscript\b/i, /\btemplate\b/i],
    artifactType: 'editable-document',
  },
  {
    type: 'search',
    patterns: [/\bsearch\b/i, /\bfind\b/i, /\blook.*for\b/i, /\bwhere\b.*\bis\b/i],
    artifactType: null,
  },
  {
    type: 'help',
    patterns: [/\bhelp\b/i, /\bwhat can you/i, /\bwhat do you/i, /\bhow (do|can|to)\b/i, /\bcommands\b/i],
    artifactType: null,
  },
];

// ============================================================
// ENTITY EXTRACTORS
// ============================================================

function extractQueueName(input: string): string | null {
  const patterns = [
    /(?:create|edit|update|delete|remove|show|a|an|the)\s+["']?([A-Za-z][A-Za-z\s]{1,30}?)["']?\s+queue/i,
    /queue\s+(?:named?|called?)\s+["']?([A-Za-z\s]+?)["']?(?:\s|$)/i,
    /["']([A-Za-z\s]+?)["']\s+queue/i,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m?.[1]) {
      const name = m[1].trim();
      if (!['a', 'an', 'the', 'new', 'this', 'that'].includes(name.toLowerCase())) {
        return name;
      }
    }
  }
  return null;
}

function extractStrategy(input: string): string {
  const strategies: Record<string, string> = {
    'least recent': 'Least Recent',
    'round robin': 'Round Robin',
    'ring all': 'Ring All',
    'fewest calls': 'Fewest Calls',
    'random': 'Random',
    'linear hunt': 'Linear Hunt',
    'linear': 'Linear Hunt',
  };
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(strategies)) {
    if (lower.includes(key)) return value;
  }
  return 'Least Recent';
}

function extractAgentNames(input: string): string[] {
  const agentNames = mockAgents.map(a => a.name.split(' ')[0].toLowerCase());
  const found: string[] = [];
  for (const agent of mockAgents) {
    const firstName = agent.name.split(' ')[0].toLowerCase();
    if (input.toLowerCase().includes(firstName) || input.toLowerCase().includes(agent.name.toLowerCase())) {
      found.push(agent.id);
    }
  }
  // Also check for generic patterns like "agent 1", "agent-001"
  return found;
}

function extractIVRName(input: string): string {
  const m = input.match(/ivr\s+(?:for\s+)?([a-z\s]+?)(?:\s+ivr)?(?:\.|,|$)/i);
  if (m?.[1]) return m[1].trim();
  if (/customer\s+support/i.test(input)) return 'Customer Support';
  if (/sales/i.test(input)) return 'Sales';
  if (/billing/i.test(input)) return 'Billing';
  if (/technical/i.test(input)) return 'Technical Support';
  return 'Main Menu';
}

function extractDocumentTitle(input: string): string {
  if (/onboarding/i.test(input)) return 'Agent Onboarding SOP';
  if (/sop/i.test(input)) return 'Standard Operating Procedure';
  if (/script/i.test(input)) return 'Call Script Template';
  if (/policy/i.test(input)) return 'Call Center Policy';
  if (/playbook/i.test(input)) return 'Sales Playbook';
  if (/guide/i.test(input)) return 'Agent Guide';
  const m = input.match(/(?:write|create|document|draft)\s+(?:a|an|the)?\s*(.{5,40})/i);
  if (m?.[1]) return m[1].trim().replace(/\b\w/g, c => c.toUpperCase());
  return 'Document';
}

// ============================================================
// RESPONSE GENERATORS
// ============================================================

const responses: Partial<Record<IntentType, (payload: Record<string, unknown>, input: string) => string>> = {
  'create-queue': (p) => {
    const name = (p.name as string) || 'New Queue';
    const strategy = p.strategy as string;
    return `I've created the **${name} Queue** editor with **${strategy}** routing strategy.\n\nYou can configure the ring time, wrap-up time, and assign agents directly in the artifact. Changes are saved in real-time.`;
  },
  'edit-queue': (p) => {
    const name = (p.name as string) || 'queue';
    return `I've opened the **${name} Queue** editor. Make your changes and click **Save** when you're done.\n\nYou can update routing strategy, ring time, wrap-up time, and agent assignments.`;
  },
  'delete-queue': (p) => {
    const name = (p.name as string) || 'queue';
    return `I need your confirmation to delete the **${name} Queue**. This action is irreversible and will remove all associated agent assignments.`;
  },
  'show-queues': () => {
    return `Here are all **${mockQueues.length} call queues** in your workspace. You can sort, filter, and manage each queue directly from this view.`;
  },
  'assign-agents': (p) => {
    const qName = (p.queueName as string) || 'the queue';
    const agents = (p.agentIds as string[]) || [];
    const agentNames = agents.map(id => mockAgents.find(a => a.id === id)?.name || id).join(', ');
    return `I've opened the **${qName} Queue** editor with the agent assignment panel. ${agentNames ? `**${agentNames}** ${agents.length === 1 ? 'has' : 'have'} been pre-selected.` : 'Select the agents you want to assign.'}\n\nClick **Save** to confirm the changes.`;
  },
  'create-ivr': (p) => {
    const name = p.name as string;
    return `I've created a **${name} IVR flow** in the visual builder. You can:\n\n- **Drag** new nodes from the panel\n- **Connect** nodes to define call paths\n- **Click** any node to edit its configuration\n\nThe flow starts with a greeting menu by default.`;
  },
  'show-contacts': () => {
    return `Here's your **Contact Directory**. You can sort, filter, search, and manage all contacts from this table.\n\nUse the column visibility button to customize what's shown.`;
  },
  'show-managers': () => {
    return `Here's a list of all **Managers** in your organization. Click any row to view their team and performance details.`;
  },
  'show-dashboard': () => {
    return `Here's your **live call center dashboard** with real-time metrics.\n\nCurrently tracking **${mockAgents.filter(a => a.status === 'online' || a.status === 'busy').length} active agents** across **${mockQueues.filter(q => q.status === 'active').length} queues**.`;
  },
  'show-recordings': () => {
    return `Here are today's **call recordings**. You can filter by agent, queue, sentiment, and duration.\n\nClick the play button to listen to any recording. Transcripts are available for highlighted entries.`;
  },
  'generate-report': () => {
    return `I've generated your **Weekly Performance Report**.\n\nThe report includes call volume trends, agent performance metrics, queue statistics, and customer satisfaction scores for the past 7 days.`;
  },
  'show-analytics': () => {
    return `Here's your **Call Center Analytics** dashboard. Explore call volume trends, agent performance, queue efficiency, and customer satisfaction metrics over the last 14 days.`;
  },
  'generate-document': (p) => {
    const title = p.title as string;
    return `I've created the **${title}** document in the editor. The document has been pre-populated with a structured template.\n\nYou can edit, format, and add content directly. The document auto-saves as you type.`;
  },
  'help': () => {
    return `Welcome to **CallCenter AI Workspace**! Here's what I can do:\n\n**Queues**\n- "Create a Sales queue with Least Recent strategy"\n- "Show all queues"\n- "Assign Aman and Priya to Sales Queue"\n\n**IVR**\n- "Create IVR for customer support"\n\n**Data**\n- "Show today's recordings"\n- "Show all contacts"\n- "Show managers"\n\n**Reports**\n- "Generate weekly performance report"\n- "Show analytics"\n- "Show dashboard"\n\n**Documents**\n- "Write onboarding SOP for new agents"\n\nYou can also press **Ctrl+K** to open the command palette.`;
  },
  'unknown': () => {
    return `I'm not sure I understood that completely. Could you rephrase your request?\n\nFor example, you could say:\n- "Create a Sales queue"\n- "Show today's call recordings"\n- "Generate a weekly report"\n- "Create IVR for customer support"\n\nOr type **"help"** to see all available commands.`;
  },
};

// ============================================================
// SUGGESTIONS
// ============================================================

const SUGGESTIONS: Partial<Record<IntentType, string[]>> = {
  'create-queue': [
    'Assign Aman to Sales Queue',
    'Set ring time to 30 seconds',
    'Show all queues',
  ],
  'show-dashboard': [
    'Generate weekly report',
    'Show today\'s recordings',
    'Show analytics',
  ],
  'show-contacts': [
    'Show managers',
    'Show all queues',
    'Generate performance report',
  ],
  'show-recordings': [
    'Show dashboard',
    'Generate weekly report',
    'Show analytics',
  ],
  'generate-report': [
    'Show analytics',
    'Show dashboard',
    'Show today\'s recordings',
  ],
  'create-ivr': [
    'Create a Sales queue',
    'Show all queues',
    'Show dashboard',
  ],
  'help': [
    'Show dashboard',
    'Create a Sales queue',
    'Show today\'s recordings',
    'Generate weekly report',
  ],
  'unknown': [
    'Show dashboard',
    'Show all queues',
    'Show today\'s recordings',
    'Help',
  ],
};

// ============================================================
// MAIN PARSE FUNCTION
// ============================================================

export function parseIntent(input: string): ParsedIntent {
  const trimmed = input.trim();
  if (!trimmed) {
    return buildResult('unknown', null, {}, trimmed);
  }

  // Find matching intent
  let matchedIntent: IntentPattern | null = null;
  let highestScore = 0;

  for (const intent of INTENT_PATTERNS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(trimmed)) {
        const score = 1;
        if (score > highestScore) {
          highestScore = score;
          matchedIntent = intent;
        }
        break;
      }
    }
  }

  if (!matchedIntent) {
    return buildResult('unknown', null, {}, trimmed);
  }

  const { type, artifactType } = matchedIntent;
  const payload = buildPayload(type, trimmed);
  return buildResult(type, artifactType, payload, trimmed);
}

function buildPayload(type: IntentType, input: string): Record<string, unknown> {
  switch (type) {
    case 'create-queue': {
      const name = extractQueueName(input) || 'New Queue';
      const strategy = extractStrategy(input);
      const agentIds = extractAgentNames(input);
      return {
        name,
        strategy,
        agentIds,
        ringTime: 30,
        wrapUpTime: 60,
        status: 'active',
        isNew: true,
      };
    }
    case 'edit-queue': {
      const name = extractQueueName(input);
      const queue = name
        ? mockQueues.find(q => q.name.toLowerCase().includes(name.toLowerCase()))
        : mockQueues[0];
      return { queue: queue || mockQueues[0], isNew: false };
    }
    case 'delete-queue': {
      const name = extractQueueName(input);
      const queue = name
        ? mockQueues.find(q => q.name.toLowerCase().includes(name.toLowerCase()))
        : mockQueues[0];
      return { queue: queue || mockQueues[0] };
    }
    case 'show-queues':
      return {};
    case 'assign-agents':
    case 'unassign-agents': {
      const agentIds = extractAgentNames(input);
      const queueName = extractQueueName(input);
      const queue = queueName
        ? mockQueues.find(q => q.name.toLowerCase().includes(queueName.toLowerCase()))
        : mockQueues[0];
      return {
        queue: queue || mockQueues[0],
        queueName: queue?.name || 'Sales',
        agentIds,
        isNew: false,
        action: type === 'assign-agents' ? 'assign' : 'unassign',
      };
    }
    case 'create-ivr': {
      const name = extractIVRName(input);
      return { name, isNew: true };
    }
    case 'edit-ivr': {
      const name = extractIVRName(input);
      return { name, isNew: false };
    }
    case 'generate-document': {
      const title = extractDocumentTitle(input);
      return { title };
    }
    default:
      return {};
  }
}

function buildResult(
  type: IntentType,
  artifactType: ArtifactType | null,
  payload: Record<string, unknown>,
  input: string
): ParsedIntent {
  const responseGenerator = responses[type] || responses['unknown']!;
  const responseText = responseGenerator(payload, input);
  const suggestions = SUGGESTIONS[type] || SUGGESTIONS['unknown'] || [];

  return {
    type,
    confidence: type === 'unknown' ? 0.3 : 0.9,
    payload,
    artifactType,
    responseText,
    suggestions,
  };
}
