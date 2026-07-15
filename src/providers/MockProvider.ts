import type { ParsedIntent, IntentType, ArtifactType } from '@/types';
import { mockAgents, mockQueues } from '@/utils/mockData';
import type { IAIProvider } from './AIProvider';

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
    patterns: [/\bassign\b.*\bagent/i, /\badd\b.*\bagent/i, /\bput\b.*\bagent/i, /\bassign\b.*\bqueue/i],
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
    type: 'create-campaign',
    patterns: [/\bcreate\b.*\bcampaign/i, /\bnew\b.*\bcampaign/i, /\bbuild\b.*\bcampaign/i, /\boutbound\b.*\bcampaign/i],
    artifactType: 'campaign-builder',
  },
  {
    type: 'show-approvals',
    patterns: [/\bapprove/i, /\bapproval/i, /\bpending.*request/i, /\bshow.*approvals/i],
    artifactType: 'approval-sheet',
  },
  {
    type: 'show-timeline',
    patterns: [/\btimeline/i, /\bjourney/i, /\bhistory.*of/i, /\bactivity.*log/i],
    artifactType: 'timeline',
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
    artifactType: 'search-results',
  },
  {
    type: 'help',
    patterns: [/\bhelp\b/i, /\bwhat can you/i, /\bwhat do you/i, /\bhow (do|can|to)\b/i, /\bcommands\b/i],
    artifactType: null,
  },
];

// Extractor Helpers
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
      if (!['a', 'an', 'the', 'new', 'this', 'that'].includes(name.toLowerCase())) return name;
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
  const found: string[] = [];
  for (const agent of mockAgents) {
    const firstName = agent.name.split(' ')[0].toLowerCase();
    if (input.toLowerCase().includes(firstName) || input.toLowerCase().includes(agent.name.toLowerCase())) {
      found.push(agent.id);
    }
  }
  return found;
}

function extractNameGenerics(input: string, fallback: string): string {
  const m = input.match(/(?:for|named|called|title)\s+([a-zA-Z\s]+?)(?:\s+|$)/i);
  if (m?.[1]) return m[1].trim();
  return fallback;
}

function extractSearchTerm(input: string): string {
  const m = input.match(/search(?:\s+for)?\s+(.+)/i) || input.match(/find\s+(.+)/i);
  if (m?.[1]) return m[1].trim();
  return input;
}

export class MockProvider implements IAIProvider {
  async parseIntent(input: string): Promise<ParsedIntent> {
    // Simulate network delay for mock provider
    await new Promise(resolve => setTimeout(resolve, 600));

    const trimmed = input.trim();
    if (!trimmed) {
      return this.buildResult('unknown', null, {}, trimmed);
    }

    let matchedIntent: IntentPattern | null = null;
    for (const intent of INTENT_PATTERNS) {
      for (const pattern of intent.patterns) {
        if (pattern.test(trimmed)) {
          matchedIntent = intent;
          break;
        }
      }
      if (matchedIntent) break;
    }

    if (!matchedIntent) {
      return this.buildResult('unknown', null, {}, trimmed);
    }

    const { type, artifactType } = matchedIntent;
    const payload = this.buildPayload(type, trimmed);
    return this.buildResult(type, artifactType, payload, trimmed);
  }

  private buildPayload(type: IntentType, input: string): Record<string, unknown> {
    switch (type) {
      case 'create-queue':
        return {
          name: extractQueueName(input) || 'New Queue',
          strategy: extractStrategy(input),
          agentIds: extractAgentNames(input),
          ringTime: 30,
          wrapUpTime: 60,
          status: 'active',
          isNew: true,
        };
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
      case 'assign-agents':
      case 'unassign-agents': {
        const queueName = extractQueueName(input);
        const queue = queueName
          ? mockQueues.find(q => q.name.toLowerCase().includes(queueName.toLowerCase()))
          : mockQueues[0];
        return {
          queue: queue || mockQueues[0],
          queueName: queue?.name || 'Sales',
          agentIds: extractAgentNames(input),
          isNew: false,
          action: type === 'assign-agents' ? 'assign' : 'unassign',
        };
      }
      case 'create-ivr':
      case 'edit-ivr':
        return { name: extractNameGenerics(input, 'Main Menu'), isNew: type === 'create-ivr' };
      case 'create-campaign':
        return { name: extractNameGenerics(input, 'Summer Outreach'), isNew: true };
      case 'generate-document':
        return { title: extractNameGenerics(input, 'Document') };
      case 'search':
        return { query: extractSearchTerm(input) };
      default:
        return {};
    }
  }

  private buildResult(
    type: IntentType,
    artifactType: ArtifactType | null,
    payload: Record<string, unknown>,
    input: string
  ): ParsedIntent {
    const responseText = this.getResponseText(type, payload, input);
    const suggestions = this.getSuggestions(type);

    return {
      type,
      confidence: type === 'unknown' ? 0.3 : 0.9,
      payload,
      artifactType,
      responseText,
      suggestions,
    };
  }

  private getResponseText(type: IntentType, payload: Record<string, unknown>, input: string): string {
    switch (type) {
      case 'create-queue':
        return `I've created the **${payload.name} Queue** editor with **${payload.strategy}** routing strategy.\n\nYou can configure the ring time, wrap-up time, and assign agents directly in the artifact.`;
      case 'edit-queue':
        return `I've opened the Queue editor. Make your changes and click **Save** when you're done.`;
      case 'delete-queue':
        return `I need your confirmation to delete the Queue. This action is irreversible.`;
      case 'show-queues':
        return `Here are all **${mockQueues.length} call queues** in your workspace.`;
      case 'assign-agents': {
        const agents = (payload.agentIds as string[]) || [];
        const agentNames = agents.map(id => mockAgents.find(a => a.id === id)?.name || id).join(', ');
        return `I've opened the Queue editor. ${agentNames ? `**${agentNames}** ${agents.length === 1 ? 'has' : 'have'} been pre-selected.` : 'Select the agents you want to assign.'}`;
      }
      case 'create-ivr':
        return `I've created a **${payload.name} IVR flow** in the visual builder.\n\n- **Drag** new nodes\n- **Connect** nodes\n- **Click** any node to edit`;
      case 'create-campaign':
        return `I've opened the **Campaign Builder** for **${payload.name}**.\n\nYou can configure target audiences, schedule outbound calling, and assign queues from this panel.`;
      case 'show-approvals':
        return `Here is your **Approval Sheet**. You have pending requests from managers and agents that require your review.`;
      case 'show-timeline':
        return `I've generated a **Timeline** view. You can see the chronological sequence of events and activities here.`;
      case 'search':
        return `Here are the search results for "**${payload.query}**" across contacts, agents, queues, and recordings.`;
      case 'show-contacts':
        return `Here's your **Contact Directory**.`;
      case 'show-managers':
        return `Here's a list of all **Managers** in your organization.`;
      case 'show-dashboard':
        return `Here's your **live call center dashboard** with real-time metrics.`;
      case 'show-recordings':
        return `Here are today's **call recordings**. You can filter by agent, queue, sentiment, and duration.`;
      case 'generate-report':
        return `I've generated your **Performance Report**.`;
      case 'show-analytics':
        return `Here's your **Call Center Analytics** dashboard.`;
      case 'generate-document':
        return `I've created the **${payload.title}** document in the editor.`;
      case 'help':
        return `Welcome to **CallCenter AI Workspace**! You can ask me to create queues, assign agents, build IVRs, or view dashboards.`;
      case 'unknown':
      default:
        return `I'm not sure I understood that. Could you rephrase your request? Try "Create a Sales queue" or "Show dashboard".`;
    }
  }

  private getSuggestions(type: IntentType): string[] {
    const suggestionsMap: Partial<Record<IntentType, string[]>> = {
      'create-queue': ['Assign Aman to Sales Queue', 'Show all queues'],
      'show-dashboard': ['Generate weekly report', 'Show analytics'],
      'create-campaign': ['Show all queues', 'Generate report'],
      'show-approvals': ['Show dashboard', 'Show managers'],
      'help': ['Show dashboard', 'Create a Sales queue', 'Show today\'s recordings'],
    };
    return suggestionsMap[type] || ['Show dashboard', 'Show all queues', 'Show today\'s recordings', 'Help'];
  }
}
