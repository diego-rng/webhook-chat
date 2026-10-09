import { Messages } from "../types/Messages.ts";
import { RefObject, SetStateAction } from "react";

export default function sendMessage(
  message: string,
  wsRef: RefObject<WebSocket | null>,
  id: string,
  messageTarget: string | null | undefined,
  setMessages: (value: SetStateAction<Messages[]>) => void,
) {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    const sentMessage: Messages = {
      userId: id,
      messageId: crypto.randomUUID(),
      value: message,
      origin: "Client",
      timeSent: new Date(),
      type: "user-message",
      target: messageTarget,
    };
    wsRef.current.send(JSON.stringify(sentMessage));
    setMessages((
      prev,
    ) => [...prev, sentMessage]);
  }
}
