import { RefObject, SetStateAction } from 'react';
import Messages from '../../../types/Messages.ts';
import logMessage from "./client-log.ts";

export default function onClientMessage(
  event: MessageEvent,
  pendingPingRef: RefObject<{ userId: string; startedAt: number } | null>,
  setPing: (value: SetStateAction<number | null>) => void,
  heartbeatTimeout: NodeJS.Timeout | null,
  setActiveUsers: (
    value: SetStateAction<(string | undefined)[] | null>,
  ) => void,
  conversationId: string
) {
  const payload: Messages = JSON.parse(String(event.data));

  if (!payload) return

  if (payload.type === 'latency-pong') {
    const pending = pendingPingRef.current;

    if (pending?.userId === payload.userId) {
      setPing(Math.round(performance.now() - pending!.startedAt));
      pendingPingRef.current = null;

      if (heartbeatTimeout !== null) {
        clearTimeout(heartbeatTimeout);
        heartbeatTimeout = null;
      }
    }

    if (payload.value) {
      const users: string[] = JSON.parse(payload.value);
      setActiveUsers(users);
    }
    
    return;
  }
  
  if (!payload.value) return
  
  if (payload.type != 'latency-pong') logMessage(payload, conversationId)
}
