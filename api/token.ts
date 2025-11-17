import { api, BASE_URL, triggerTokenExpiration } from '@/lib/api-client';

const ENDPOINT = '/opie/api/v1/usage/tokens'

export const getTokenUsage = async (page: number = 1,page_size: number,
  search: string) => {
  const response = await api.get(`${ENDPOINT}/`, {
    params: { page: page.toString(), page_size: page_size.toString(), search: search },
  });
  return response;
};

export const getTokenUsagebyUser = async () => {
  const response = await api.get(`${ENDPOINT}/user/`, {
  });
  return response;
};

export const getUserTokenSummary = async (page: number = 1,page_size: number,
  search: string) => {
  const response = await api.get(`${ENDPOINT}/usersummary/`, {
    params: { page: page.toString(), page_size: page_size.toString(), search: search },
  });
  return response;
};

export const getTokenSummarybyUser = async () => {
  const response = await api.get(`${ENDPOINT}/currentuser/`, {});
  return response;
};