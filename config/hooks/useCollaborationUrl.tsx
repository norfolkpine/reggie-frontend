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
      ? `wss://${window.location.hostname}:4444/collaboration/ws/`
      : '');

  return `${base}?room=${room}`;
};
