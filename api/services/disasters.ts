import { apiClient } from '../client';

export const disastersService = {
  getDisasters: async (): Promise<Disaster[]> => {
    const { data } = await apiClient.get<any>('/api/v1/disasters');
    return data.data || data;
  },

  getDisasterById: async (id: string): Promise<Disaster> => {
    const { data } = await apiClient.get<any>(`/api/v1/disasters/${id}`);
    return data.data || data;
  },
};
