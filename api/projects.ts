import { api } from '@/lib/api-client';
import { Project, PaginatedProjectList, PatchedProject } from '../types/api';

export const getProjects = async (page: number = 1) => {
  const response = await api.get('/reggie/api/v1/projects/', {
    params: { page: page.toString() }
  });
  return response as PaginatedProjectList;
};

export const getProject = async (id: number) => {
  const response = await api.get(`/reggie/api/v1/projects/${id}/`);
  return response as Project;
};

export const createProject = async (project: Omit<Partial<Project>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/api/v1/projects/', project);
  return response as Project;
};

export const updateProject = async (id: number, project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/api/v1/projects/${id}/`, project);
  return response as Project;
};

export const patchProject = async (id: number, project: PatchedProject) => {
  const response = await api.post(`/reggie/api/v1/projects/${id}/`, project);
  return response as Project;
};

export const deleteProject = async (id: number) => {
  await api.delete(`/reggie/api/v1/projects/${id}/`);
};