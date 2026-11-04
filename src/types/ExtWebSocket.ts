import WebSocket from "ws";

export interface ExtWebSocket extends WebSocket {
  conversationId?: string;
  isAlive: boolean;
  userId: string;
}