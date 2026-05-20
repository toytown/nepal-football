import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type {
  Bootstrap,
  Milestone,
  PrepItem,
  Task,
  Team,
} from '@nepal-football/shared';

import { apiFetch } from './client';

// ─── Query keys ────────────────────────────────────────────────────────────
export const QK = {
  bootstrap:   ['bootstrap'] as const,
  tasks:       ['tasks'] as const,
  teams:       ['teams'] as const,
  prep:        ['prep'] as const,
  milestones:  ['milestones'] as const,
};

// ─── Queries ───────────────────────────────────────────────────────────────
export function useBootstrap() {
  return useQuery({
    queryKey: QK.bootstrap,
    queryFn: () => apiFetch<Bootstrap>('/bootstrap'),
  });
}

export function useTasks() {
  return useQuery({
    queryKey: QK.tasks,
    queryFn: () => apiFetch<Task[]>('/tasks'),
  });
}

export function useTeams() {
  return useQuery({
    queryKey: QK.teams,
    queryFn: () => apiFetch<Team[]>('/teams'),
  });
}

export function usePrepItems() {
  return useQuery({
    queryKey: QK.prep,
    queryFn: () => apiFetch<PrepItem[]>('/prep-items'),
  });
}

export function useMilestones() {
  return useQuery({
    queryKey: QK.milestones,
    queryFn: () => apiFetch<Milestone[]>('/milestones'),
  });
}

// ─── Mutations: optimistic update + rollback on error ──────────────────────

interface TogglePayload {
  id: string;
  done: boolean;
}

/**
 * Build a generic toggle mutation that:
 *   1. Cancels in-flight queries for the affected list(s)
 *   2. Snapshots previous data
 *   3. Optimistically updates the cache (and bootstrap cache if present)
 *   4. Rolls back + toasts on error
 *   5. Invalidates the queries on settle
 */
function makeToggleMutation<T extends { id: string; done: boolean }>(opts: {
  endpoint: (id: string) => string;
  listKey: readonly string[];
  bootstrapKey: keyof Bootstrap;
}) {
  return function useToggle(): UseMutationResult<T, Error, TogglePayload, ToggleSnapshot<T>> {
    const qc = useQueryClient();
    return useMutation<T, Error, TogglePayload, ToggleSnapshot<T>>({
      mutationFn: ({ id, done }) =>
        apiFetch<T>(opts.endpoint(id), {
          method: 'PATCH',
          body: JSON.stringify({ done }),
        }),

      onMutate: async ({ id, done }) => {
        await qc.cancelQueries({ queryKey: opts.listKey });
        await qc.cancelQueries({ queryKey: QK.bootstrap });

        const prevList = qc.getQueryData<T[]>(opts.listKey);
        const prevBootstrap = qc.getQueryData<Bootstrap>(QK.bootstrap);

        if (prevList) {
          qc.setQueryData<T[]>(
            opts.listKey,
            prevList.map((it) => (it.id === id ? { ...it, done } : it)),
          );
        }
        if (prevBootstrap) {
          const list = prevBootstrap[opts.bootstrapKey] as unknown as T[];
          qc.setQueryData<Bootstrap>(QK.bootstrap, {
            ...prevBootstrap,
            [opts.bootstrapKey]: list.map((it) => (it.id === id ? { ...it, done } : it)),
          });
        }

        return { prevList, prevBootstrap };
      },

      onError: (_err, _vars, ctx) => {
        if (ctx?.prevList) qc.setQueryData(opts.listKey, ctx.prevList);
        if (ctx?.prevBootstrap) qc.setQueryData(QK.bootstrap, ctx.prevBootstrap);
        toast.error("Couldn't save change, please retry");
      },

      onSettled: () => {
        qc.invalidateQueries({ queryKey: opts.listKey });
        qc.invalidateQueries({ queryKey: QK.bootstrap });
      },
    });
  };
}

interface ToggleSnapshot<T> {
  prevList: T[] | undefined;
  prevBootstrap: Bootstrap | undefined;
}

export const useToggleTask = makeToggleMutation<Task>({
  endpoint: (id) => `/tasks/${id}`,
  listKey: QK.tasks,
  bootstrapKey: 'tasks',
});

export const useTogglePrepItem = makeToggleMutation<PrepItem>({
  endpoint: (id) => `/prep-items/${id}`,
  listKey: QK.prep,
  bootstrapKey: 'prepItems',
});

export const useToggleMilestone = makeToggleMutation<Milestone>({
  endpoint: (id) => `/milestones/${id}`,
  listKey: QK.milestones,
  bootstrapKey: 'milestones',
});
