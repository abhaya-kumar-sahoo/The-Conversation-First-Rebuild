// ============================================================
// DOMAIN TYPES
// ============================================================

export type QueueStrategy =
  | 'Least Recent'
  | 'Ring All'
  | 'Round Robin'
  | 'Fewest Calls'
  | 'Random'
  | 'Linear Hunt';

export type QueueStatus = 'active' | 'inactive' | 'paused';

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'break';
  extension: string;
  skills: string[];
  queues: string[];
  callsHandled: number;
  avgHandleTime: number; // seconds
  satisfaction: number; // 0-100
  department: string;
  joinedAt: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  agentsManaged: number;
  phone: string;
  role: string;
  joinedAt: string;
}

export interface Queue {
  id: string;
  name: string;
  strategy: QueueStrategy;
  ringTime: number; // seconds
  wrapUpTime: number; // seconds
  status: QueueStatus;
  agents: string[]; // agent IDs
  maxWaitTime: number; // seconds
  musicOnHold: string;
  priority: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'blocked';
  tags: string[];
  lastContact: string;
  totalCalls: number;
  notes: string;
  createdAt: string;
}

export interface Recording {
  id: string;
  contactName: string;
  agentName: string;
  queueName: string;
  duration: number; // seconds
  date: string;
  type: 'inbound' | 'outbound';
  sentiment: 'positive' | 'neutral' | 'negative';
  transcriptAvailable: boolean;
  size: number; // bytes
  callId: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'inbound' | 'outbound' | 'blended';
  status: 'running' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  targetCalls: number;
  completedCalls: number;
  agents: string[];
  queue: string;
}

export interface CallMetric {
  date: string;
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  avgHandleTime: number;
  avgWaitTime: number;
  satisfaction: number;
  firstCallResolution: number;
}

// ============================================================
// IVR TYPES
// ============================================================

export type IVRNodeType =
  | 'ivr-menu'
  | 'ivr-transfer'
  | 'ivr-playback'
  | 'ivr-queue'
  | 'ivr-hangup'
  | 'ivr-voicemail'
  | 'ivr-start';

export interface IVRNodeData {
  label: string;
  type: IVRNodeType;
  message?: string;
  options?: { key: string; label: string }[];
  transferTo?: string;
  queueId?: string;
  audioFile?: string;
}

// ============================================================
// ARTIFACT TYPES
// ============================================================

export type ArtifactType =
  | 'queue-editor'
  | 'queue-list'
  | 'ivr-builder'
  | 'contact-table'
  | 'manager-table'
  | 'dashboard'
  | 'report'
  | 'analytics'
  | 'editable-document'
  | 'recordings'
  | 'confirmation-dialog'
  | 'empty-state';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  subtitle?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  conversationId: string;
}

// ============================================================
// CONVERSATION TYPES
// ============================================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'streaming' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: string;
  artifactId?: string;
  artifactType?: ArtifactType;
  suggestions?: string[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isPinned: boolean;
  messageCount: number;
}

// ============================================================
// AI ENGINE TYPES
// ============================================================

export type IntentType =
  | 'create-queue'
  | 'edit-queue'
  | 'delete-queue'
  | 'assign-agents'
  | 'unassign-agents'
  | 'create-ivr'
  | 'edit-ivr'
  | 'show-contacts'
  | 'show-managers'
  | 'show-dashboard'
  | 'show-recordings'
  | 'generate-report'
  | 'generate-document'
  | 'search'
  | 'show-analytics'
  | 'show-queues'
  | 'help'
  | 'unknown';

export interface ParsedIntent {
  type: IntentType;
  confidence: number;
  payload: Record<string, unknown>;
  artifactType: ArtifactType | null;
  responseText: string;
  suggestions?: string[];
}

// ============================================================
// UI TYPES
// ============================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface SavedPrompt {
  id: string;
  label: string;
  prompt: string;
  category: string;
}
