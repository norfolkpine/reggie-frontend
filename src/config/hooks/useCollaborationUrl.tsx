import { useConfig } from '../api';

export const useCollaborationUrl = (room?: string) => {
  const { data: conf } = useConfig();

  if (!room) {
    return;
  }

  console.log('conf', conf);
  const base =
    conf?.COLLABORATION_WS_URL ||
    (typeof window !== 'undefined'
      ? `ws://${window.location.hostname}:4444/collaboration/ws/`
      : '');

  // Try to bypass CORS by using a different approach
  const url = `${base}?room=${room}`;
  console.log('🔗 Generated collaboration URL:', url);
  return url;
};
