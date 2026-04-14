import { apiClient } from '../client';

export const incidentsService = {
  getIncidents: async (): Promise<Incident[]> => {
    const { data } = await apiClient.get<any>('/api/v1/incidents');
    console.log(data);
    return data.data as Incident[];
  },

  getIncidentById: async (id: string): Promise<Incident> => {
    const { data } = await apiClient.get<any>(`/api/v1/incidents/${id}`);
    return data.data || data;
  },

  createIncident: async (dto: ReportIncidentDto): Promise<Incident> => {
    const { data } = await apiClient.post<any>('/api/v1/incidents', dto);
    return data.data || data;
  },

  updateIncident: async ({ id, dto }: { id: string; dto: Partial<ReportIncidentDto> }): Promise<Incident> => {
    const { data } = await apiClient.put<any>(`/api/v1/incidents/${id}`, dto);
    return data.data || data;
  },
};
