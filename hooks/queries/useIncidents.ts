import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { incidentsService } from '../../api/services/incidents';
import { queryKeys } from './keys';

export const useIncidents = () => {
  return useQuery({
    queryKey: queryKeys.incidents.lists(),
    queryFn: incidentsService.getIncidents,
  });
};

export const useIncidentById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.incidents.detail(id),
    queryFn: () => incidentsService.getIncidentById(id),
    enabled: !!id,
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incidentsService.createIncident,
    onSuccess: () => {
      // Invalidate the list queries so that new incidents show up automatically
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.lists() });
    },
  });
};

export const useUpdateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incidentsService.updateIncident,
    onSuccess: (updatedIncident) => {
      // Invalidate both the list and the specific detail query
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(updatedIncident.id) });
    },
  });
};
