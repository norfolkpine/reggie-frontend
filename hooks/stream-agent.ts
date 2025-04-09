import { useEffect, useRef, useState } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';

interface UseStreamAgentOptions {
  agent_id: string;
  message: string;
  sessionId: string;
  onDone?: (final: string) => void;
}

export function useStreamAgent({ agent_id, message, sessionId, onDone }: UseStreamAgentOptions) {
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);

  useEffect(() => {
    if (!agent_id || !message || !sessionId) return;

    const token = localStorage.getItem('access_token');

    const es = new EventSourcePolyfill('http://127.0.0.1:8000/reggie/api/v1/agent/stream-chat/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream'
      },
      payload: JSON.stringify({
        agent_id,
        message,
        session_id: sessionId,
      }),
    });

    eventSourceRef.current = es;
    setOutput('');
    setIsStreaming(true);

    let buffer = '';

    es.onmessage = (event) => {
      if (event.data === '[DONE]') {
        es.close();
        setIsStreaming(false);
        onDone?.(buffer);
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.token) {
          buffer += data.token;
          setOutput((prev) => prev + data.token);
        }
      } catch (err) {
        console.error('Error parsing stream chunk:', err);
      }
    };

    es.onerror = (err) => {
      console.error('Stream error:', err);
      es.close();
      setIsStreaming(false);
    };

    return () => es.close();
  }, [agent_id, message, sessionId]);

  const cancel = () => {
    eventSourceRef.current?.close();
    setIsStreaming(false);
  };

  return { output, isStreaming, cancel };
}