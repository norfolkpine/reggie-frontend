import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

import { Doc } from '../types';

import { KEY_LIST_DOC } from './useDocs';

export const createDoc = async (params: { title: string; description?: string }): Promise<Doc> => {
  const response = await fetchAPI(`documents/`, {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new APIError('Failed to create the doc', await errorCauses(response));
  }

  return response.json() as Promise<Doc>;
};

interface CreateDocProps {
  onSuccess: (data: Doc) => void;
}

export function useCreateDoc({ onSuccess }: CreateDocProps) {
  const queryClient = useQueryClient();
  return useMutation<Doc, APIError, { title: string; description?: string }>({
    mutationFn: createDoc,
    onSuccess: (data) => {
      void queryClient.resetQueries({
        queryKey: [KEY_LIST_DOC],
      });
      onSuccess(data);
    },
  });
}
