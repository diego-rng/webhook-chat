import { RefObject, SetStateAction } from "react";
import { Messages } from "../types/Messages.ts";

export default function onClientMessage(
  event: MessageEvent,
  pendingPingRef: RefObject<{ userId: string; startedAt: number } | null>,
  setPing: (value: SetStateAction<number | null>) => void,
  heartbeatTimeout: NodeJS.Timeout | null,
  setActiveUsers: (
    value: SetStateAction<(string | undefined)[] | null>,
  ) => void,
  setMessages: (value: SetStateAction<Messages[]>) => void,
  
) {
  const payload: Messages = JSON.parse(String(event.data));

  if (payload?.type === "latency-pong") {
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

  if (payload.type === "message-confirmation") {
    setMessages((prev) =>
      prev.map((item) =>
        item.messageId === payload.messageId ? { ...item, seen: true } : item
      )
    );
    console.log("Server received the message!");
    return;
  }

  console.log(`Received a message from the server: ${event.data}`);
  setMessages((
    prev,
  ) => [...prev, {
    messageId: payload.messageId,
    value: payload.value,
    origin: payload.origin,
    timeSent: new Date(),
  }]);
}
