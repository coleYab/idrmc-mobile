import { useQuery } from '@tanstack/react-query';
import { disastersService } from '../../api/services/disasters';
import { queryKeys } from './keys';

export const useDisasters = () => {
  return useQuery({
    queryKey: queryKeys.disasters.lists(),
    queryFn: disastersService.getDisasters,
  });
};

export const useDisasterById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.disasters.detail(id),
    queryFn: () => disastersService.getDisasterById(id),
    enabled: !!id,
  });
};
