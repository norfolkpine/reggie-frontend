import { api } from '@/lib/api-client';
import { Project, PaginatedProjectList, PatchedProject } from '../types/api';

export const getProjects = async (page: number = 1) => {
  console.log('Fetching projects list, page:', page);
  
  try {
    const response = await api.get('/reggie/api/v1/projects/', {
      params: { page: page.toString() }
    });
    console.log('Projects list response:', response);
    return response as PaginatedProjectList;
  } catch (error) {
    console.error('Error fetching projects list:', error);
    throw error;
  }
};

export const getProject = async (id: string) => {
  console.log('Fetching project with ID:', id);
  
  // Try different endpoint patterns
  const endpoints = [
    `/reggie/api/v1/projects/${id}/`,
    `/reggie/api/v1/projects/uuid/${id}/`,
    `/reggie/api/v1/projects/by-uuid/${id}/`,
    `/reggie/api/v1/projects/?uuid=${id}`,
    `/reggie/api/v1/projects/?project_uuid=${id}`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log('Trying endpoint:', endpoint);
      const response = await api.get(endpoint);
      console.log('Project response:', response);
      return response as Project;
    } catch (error: any) {
      console.log(`Endpoint ${endpoint} failed:`, error.status || error.message);
      if (error.status === 404) {
        continue; // Try next endpoint
      }
      throw error; // Re-throw non-404 errors
    }
  }
  
  throw new Error(`Project not found. Tried endpoints: ${endpoints.join(', ')}`);
};

export const createProject = async (project: Omit<Partial<Project>, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.post('/reggie/api/v1/projects/', project);
  return response as Project;
};

export const updateProject = async (id: string, project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await api.put(`/reggie/api/v1/projects/${id}/`, project);
  return response as Project;
};

export const patchProject = async (id: number, project: PatchedProject) => {
  const response = await api.post(`/reggie/api/v1/projects/${id}/`, project);
  return response as Project;
};

export const deleteProject = async (id: string) => {
  await api.delete(`/reggie/api/v1/projects/${id}/`);
};