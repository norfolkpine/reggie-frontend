import { api } from '@/lib/api-client';
import { PaginatedExpectedOutputs, ExpectedOutput } from '@/types/api';

export const getExpectedOutputs = async () => {
  const response = await api.get('/reggie/api/expected-output/');
  return response as PaginatedExpectedOutputs;
};

export const getExpectedOutput = async (id: number) => {
  const response = await api.get(`/reggie/api/expected-output/${id}/`);
  return response as ExpectedOutput;
};

export const createExpectedOutput = async (expectedOutput: Omit<Partial<ExpectedOutput>, 'id' | 'created_at'>) => {
  const response = await api.post('/reggie/api/expected-output/', expectedOutput);
  return response as ExpectedOutput;
};

export const updateExpectedOutput = async (id: number, expectedOutput: Omit<ExpectedOutput, 'id' | 'created_at'>) => {
  const response = await api.put(`/reggie/api/expected-output/${id}/`, expectedOutput);
  return response as ExpectedOutput;
};

export const patchExpectedOutput = async (id: number, expectedOutput: Partial<ExpectedOutput>) => {
  const response = await api.post(`/reggie/api/expected-output/${id}/`, expectedOutput);
  return response as ExpectedOutput;
};

export const deleteExpectedOutput = async (id: number) => {
  await api.delete(`/reggie/api/expected-output/${id}/`);
};