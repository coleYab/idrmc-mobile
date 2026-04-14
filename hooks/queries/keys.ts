export const queryKeys = {
  incidents: {
    all: ['incidents'] as const,
    lists: () => [...queryKeys.incidents.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.incidents.all, 'detail', id] as const,
  },
  disasters: {
    all: ['disasters'] as const,
    lists: () => [...queryKeys.disasters.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.disasters.all, 'detail', id] as const,
  },
};
