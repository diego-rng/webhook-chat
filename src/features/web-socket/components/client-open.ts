import { SetStateAction } from "react";
import { Messages } from "../types/Messages.ts";

export function onClientOpen(ws: WebSocket, id: string, setMessages: (value: SetStateAction<Messages[]>) => void, sendHeartbeat: () => void, heartbeatInterval: NodeJS.Timeout | null) {
  console.log("[Client] Connected.");
  const identMessage: Messages = {
    messageId: crypto.randomUUID(),
    type: "identification-msg",
    userId: id,
    origin: "Client",
    timeSent: new Date(),
  };
  ws.send(JSON.stringify(identMessage));
  const openMessage: Messages = {
    type: "opening-message",
    messageId: crypto.randomUUID(),
    value: `Attempting Connection`,
    userId: id,
    origin: "Client",
    timeSent: new Date(),
  };
  ws.send(JSON.stringify(openMessage));
  setMessages((
    prev,
  ) => [...prev, openMessage]);
  sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, 5000);
}