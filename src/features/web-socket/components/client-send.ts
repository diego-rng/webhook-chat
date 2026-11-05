import Messages from '../../../types/Messages.ts';
import { RefObject, SetStateAction } from 'react';
import logMessage from "./client-log.ts";

export default function sendMessage(
  message: string,
  wsRef: RefObject<WebSocket | null>,
  username: string,
  id: string,
  messageTarget: string | null | undefined,
  setMessages: (value: SetStateAction<Messages[]>) => void,
) {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    const sentMessage: Messages = {
      userId: id,
      messageId: crypto.randomUUID(),
      username: username,
      value: message,
      origin: 'Client',
      timeSent: new Date(),
      type: message.startsWith('data:') ? 'user-image' : 'user-message',
      target: messageTarget,
    };
    wsRef.current.send(JSON.stringify(sentMessage));
    setMessages((prev) => [sentMessage, ...prev]);
    logMessage(sentMessage, messageTarget!)
  }
}
