import { api } from '@/lib/api-client';
import { StorageBucket, PaginatedStorageBucketList, PatchedStorageBucket } from '../types/api';

export const getStorageBuckets = async (page: number = 1) => {
  const response = await api.get('/opie/storage-buckets/', {
    params: { page: page.toString() }
  });
  return response as PaginatedStorageBucketList;
};

export const getStorageBucket = async (id: number) => {
  const response = await api.get(`/opie/storage-buckets/${id}/`);
  return response as StorageBucket;
};

export const createStorageBucket = async (storageBucket: Omit<StorageBucket, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/opie/storage-buckets/', storageBucket);
  return response as StorageBucket;
};

export const updateStorageBucket = async (id: number, storageBucket: Omit<StorageBucket, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/opie/storage-buckets/${id}/`, storageBucket);
  return response as StorageBucket;
};

export const patchStorageBucket = async (id: number, storageBucket: PatchedStorageBucket) => {
  const response = await api.post(`/opie/storage-buckets/${id}/`, storageBucket);
  return response as StorageBucket;
};

export const deleteStorageBucket = async (id: number) => {
  await api.delete(`/opie/storage-buckets/${id}/`);
};