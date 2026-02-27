import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface ThinkingStep {
  step: string;
  timestamp: string;
}

interface ChatResponse {
  text: string;
  activeWidget: string | null;
  widgetData: unknown;
  timestamp: string;
}

interface UseSocketReturn {
  isConnected: boolean;
  thinkingSteps: ThinkingStep[];
  sendMessage: (message: string) => void;
  lastResponse: ChatResponse | null;
  isProcessing: boolean;
  error: string | null;
  clearThinking: () => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
if(!SERVER_URL && !import.meta.env.VITE_SERVER_URL ) {
  console.warn('SERVER_URL is not defined in environment variables.');
}

export function useSocket(serverUrl: string = SERVER_URL): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log(' Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log(' Disconnected from server');
    });

    socket.on('thinking:step', (data: ThinkingStep) => {
      setThinkingSteps((prev) => [...prev, data]);
    });

    socket.on('chat:response', (data: ChatResponse) => {
      setLastResponse(data);
      setIsProcessing(false);
    });

    socket.on('chat:error', (data: { error: string }) => {
      setError(data.error);
      setIsProcessing(false);
    });

    socket.on('connect_error', () => {
      setError('Unable to connect to server. Make sure the server is running.');
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current?.connected) {
      setIsProcessing(true);
      setError(null);
      setThinkingSteps([]);
      socketRef.current.emit('chat:message', { message });
    }
  }, []);

  const clearThinking = useCallback(() => {
    setThinkingSteps([]);
  }, []);

  return {
    isConnected,
    thinkingSteps,
    sendMessage,
    lastResponse,
    isProcessing,
    error,
    clearThinking,
  };
}
