import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Doc, LinkReach, LinkRole } from '../types';
import { getDocument } from '@/api/documents';

export type DocParams = {
  id: string;
};

export const getDoc = async ({ id }: DocParams): Promise<Doc> => {
  const response = await getDocument(id);

  if (!response) {
    throw new APIError('Failed to get the doc', await errorCauses(response));
  }

  console.log('getDoc', response);

  return Promise.resolve(response as Doc);
};

export const KEY_DOC = 'doc';
export const KEY_DOC_VISIBILITY = 'doc-visibility';

export function useDoc(
  param: DocParams,
  queryConfig?: UseQueryOptions<Doc, APIError, Doc>
) {
  return useQuery<Doc, APIError, Doc>({
    queryKey: [KEY_DOC, param],
    queryFn: () => getDoc(param),
    ...queryConfig,
  });
}
