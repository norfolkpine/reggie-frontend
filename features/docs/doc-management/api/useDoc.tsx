import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Doc, LinkReach, LinkRole } from '../types';

export type DocParams = {
  id: string;
};

export const getDoc = async ({ id }: DocParams): Promise<Doc> => {
  return {
    id: '123',
    title: 'Test',
    content: 'Test',
    created_at: '2021-01-01',
    updated_at: '2021-01-01',
    creator: 'Test',
    is_favorite: false,
    link_reach: LinkReach.PUBLIC,
    link_role: LinkRole.READER,
    nb_accesses_ancestors: 0,
    nb_accesses_direct: 0,
    abilities: {
      accesses_manage: false,
      accesses_view: false,
      ai_transform: false,
      ai_translate: false,
      attachment_upload: false,
      children_create: false,
      children_list: false,
      collaboration_auth: false,
      destroy: false,
      favorite: false,
      invite_owner: false,
      link_configuration: false,
      media_auth: false,
      move: false,
      partial_update: false,
      restore: false,
      retrieve: false,
      update: false,
      versions_destroy: false,
      versions_list: false,
      versions_retrieve: false,
    },
  };

  const response = await fetchAPI(`documents/${id}/`);

  if (!response.ok) {
    throw new APIError('Failed to get the doc', await errorCauses(response));
  }

  return response.json() as Promise<Doc>;
};

export const KEY_DOC = 'doc';
export const KEY_DOC_VISIBILITY = 'doc-visibility';

export function useDoc(
  param: DocParams,
  queryConfig?: UseQueryOptions<Doc, APIError, Doc>,
) {
  return useQuery<Doc, APIError, Doc>({
    queryKey: [KEY_DOC, param],
    queryFn: () => getDoc(param),
    ...queryConfig,
  });
}
