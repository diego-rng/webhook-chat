import WebSocket, { WebSocketServer } from "ws";

export interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

const port = 8080;
const wss = new WebSocketServer({ port });

wss.on("connection", (ws: ExtWebSocket) => {
  ws.isAlive = true;
  ws.on("message", (data) => {
    let message: { type?: string; id?: string } | null = null;
    try {
      message = JSON.parse(data.toString());
    } catch {
      message = null;
    }
    if (message?.type === "latency-ping" && message.id) {
      ws.send(JSON.stringify({ type: "latency-pong", id: message.id }));
      return;
    }

    console.log(`Received message from client: ${data}`);
    ws.send(`Message received!`);
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.send(`Hello, this is main.ts`);
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
