import { RefObject, SetStateAction, useEffect } from "react";
import { Messages } from "../types/Messages.ts";
import onClientMessage from "../components/client-message.ts";
import onClientOpen from "../components/client-open.ts";

export default function useClientConnection(
  port: number,
  pendingPingRef: RefObject<{userId: string, startedAt: number} | null>,
  id: string,
  setPing: (value: SetStateAction<number | null>) => void,
  wsRef: RefObject<WebSocket | null>,
  setMessages: (value: SetStateAction<Messages[]>) => void,
  setActiveUsers: (value: SetStateAction<(string | undefined)[] | null>) => void,
) {
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;

    function sendHeartbeat() {
      if (ws.readyState != WebSocket.OPEN || pendingPingRef.current !== null) {
        return;
      }

      const heartbeatMessage: Messages = {
        messageId: crypto.randomUUID(),
        type: "latency-ping",
        userId: id,
        timeSent: new Date(),
        origin: "Client",
      };
      pendingPingRef.current = { userId: id, startedAt: performance.now() };
      ws.send(JSON.stringify(heartbeatMessage));

      heartbeatTimeout = setTimeout(() => {
        if (pendingPingRef.current?.userId === id) {
          pendingPingRef.current = null;
          setPing(null);
        }
      }, 3000);
    }
    wsRef.current = ws;
    ws.onopen = () =>
      onClientOpen(ws, id, setMessages, sendHeartbeat, heartbeatTimeout);

    ws.onmessage = (event) =>
      onClientMessage(
        event,
        pendingPingRef,
        setPing,
        heartbeatTimeout,
        setActiveUsers,
        setMessages,
      );

    ws.onclose = () => {
      setPing(null);
      pendingPingRef.current = null;
      if (heartbeatInterval !== null) clearInterval(heartbeatInterval);
      if (heartbeatTimeout !== null) clearTimeout(heartbeatTimeout);
      console.log("WebSocket disconnected");
    };
    ws.onerror = (error) => console.error(`${error}`);

    console.log(`Listening at ${port}`);

    return () => {
      if (heartbeatInterval !== null) clearInterval(heartbeatInterval);
      if (heartbeatTimeout !== null) clearTimeout(heartbeatTimeout);
      pendingPingRef.current = null;
      ws.close();
    };
  }, []);
}
