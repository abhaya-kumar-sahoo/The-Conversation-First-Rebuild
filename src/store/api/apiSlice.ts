import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Queue, Agent, Contact, Manager, Recording } from '@/types';
import {
  mockQueues,
  mockAgents,
  mockContacts,
  mockManagers,
  mockRecordings,
} from '@/utils/mockData';

// Simulated network latency
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const fakeLatency = () => delay(500 + Math.random() * 700);

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Queue', 'Agent', 'Contact', 'Manager', 'Recording'],
  endpoints: builder => ({
    getQueues: builder.query<Queue[], void>({
      queryFn: async () => {
        await fakeLatency();
        return { data: mockQueues };
      },
      providesTags: ['Queue'],
    }),
    getQueue: builder.query<Queue | undefined, string>({
      queryFn: async (id) => {
        await fakeLatency();
        return { data: mockQueues.find(q => q.id === id) };
      },
      providesTags: (_r, _e, id) => [{ type: 'Queue', id }],
    }),
    getAgents: builder.query<Agent[], void>({
      queryFn: async () => {
        await fakeLatency();
        return { data: mockAgents };
      },
      providesTags: ['Agent'],
    }),
    getContacts: builder.query<Contact[], void>({
      queryFn: async () => {
        await fakeLatency();
        return { data: mockContacts };
      },
      providesTags: ['Contact'],
    }),
    getManagers: builder.query<Manager[], void>({
      queryFn: async () => {
        await fakeLatency();
        return { data: mockManagers };
      },
      providesTags: ['Manager'],
    }),
    getRecordings: builder.query<Recording[], void>({
      queryFn: async () => {
        await fakeLatency();
        return { data: mockRecordings };
      },
      providesTags: ['Recording'],
    }),
    createQueue: builder.mutation<Queue, Partial<Queue>>({
      queryFn: async (queue) => {
        await fakeLatency();
        const newQueue: Queue = {
          id: `queue-${Date.now()}`,
          name: queue.name || 'New Queue',
          strategy: queue.strategy || 'Least Recent',
          ringTime: queue.ringTime || 30,
          wrapUpTime: queue.wrapUpTime || 60,
          status: 'active',
          agents: queue.agents || [],
          maxWaitTime: queue.maxWaitTime || 120,
          musicOnHold: 'corporate-01.mp3',
          priority: 1,
          description: queue.description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { data: newQueue };
      },
      invalidatesTags: ['Queue'],
    }),
    updateQueue: builder.mutation<Queue, Partial<Queue> & { id: string }>({
      queryFn: async (queue) => {
        await fakeLatency();
        const existing = mockQueues.find(q => q.id === queue.id);
        const updated = { ...existing!, ...queue, updatedAt: new Date().toISOString() };
        return { data: updated };
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Queue', id }],
    }),
    deleteQueue: builder.mutation<{ success: boolean }, string>({
      queryFn: async () => {
        await fakeLatency();
        return { data: { success: true } };
      },
      invalidatesTags: ['Queue'],
    }),
  }),
});

export const {
  useGetQueuesQuery,
  useGetQueueQuery,
  useGetAgentsQuery,
  useGetContactsQuery,
  useGetManagersQuery,
  useGetRecordingsQuery,
  useCreateQueueMutation,
  useUpdateQueueMutation,
  useDeleteQueueMutation,
} = api;
