import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/api/projects';
import { PaginatedProjectList } from '@/types/api';
import { APIError } from '@/api';

const KEY_LIST_PROJECTS = 'projects';

export interface ProjectsParams {
  page?: number;
  owner?: number;
}

export function useProjects(
  params: ProjectsParams = {},
) {
  return useQuery<PaginatedProjectList, APIError, PaginatedProjectList>({
    queryKey: [KEY_LIST_PROJECTS, params],
    queryFn: () => getProjects(params.page || 1),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 