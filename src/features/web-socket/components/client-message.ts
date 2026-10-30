import { RefObject, SetStateAction } from 'react';
import Messages from '../../../types/Messages.ts';
import { db } from "../../../prisma/db.ts";

export default async function onClientMessage(
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

  if (payload?.type === 'latency-pong') {
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

  await db.orm.public.Message.create({
    content: payload.value,
    conversation_id: conversationId,
    sent_by: payload.userId,
  })
}
