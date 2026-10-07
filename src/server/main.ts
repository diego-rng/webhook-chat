import WebSocket, { WebSocketServer } from "ws";
import { Messages } from "../app/page.tsx";

export interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
  userId: string;
}

const port = 8080;
const wss = new WebSocketServer({ port });

wss.on("connection", (ws: ExtWebSocket) => {
  ws.isAlive = true;
  ws.on("message", (data) => {
    const message: Messages = JSON.parse(data.toString());

    if (message.type === "latency-ping" && message.userId) {
      const userIds = [...wss.clients].map((c) => (c as ExtWebSocket).userId).filter(Boolean);
      const response: Messages = {
        type: "latency-pong",
        userId: message.userId,
        origin: "Server",
        timeSent: new Date(),
        messageId: message.messageId,
        value: JSON.stringify(userIds),
      };
      ws.send(JSON.stringify(response));
      return;
    }
    if (message.type === "identification-msg" && message.userId) {
      ws.userId = message.userId;
      return;
    }

    console.log(`Received message from client: ${message.value}`);

    const target = [...wss.clients].find(
      (c) => (c as ExtWebSocket).userId === message.target,
    );
    if (target && target.readyState === WebSocket.OPEN) {
      target.send(JSON.stringify(message))
    }

    const confirmation: Messages = {
      type: "message-confirmation",
      userId: message.userId,
      timeSent: new Date(),
      origin: "Server",
      messageId: message.messageId,
    };
    ws.send(JSON.stringify(confirmation));
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  const startMessage: Messages = {
    type: "start-message",
    userId: "0000",
    value: `Connected.`,
    messageId: crypto.randomUUID(),
    origin: "Server",
    timeSent: new Date(),
  };
  ws.send(JSON.stringify(startMessage));
});

const interval = setInterval(() => {
  wss.clients.forEach((client) => {
    const ws = client as ExtWebSocket;
    if (ws.isAlive === false) {
      console.log("Client unresponsive. Terminating");
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping("ping");
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

console.log(`Listening at ${port}`);
