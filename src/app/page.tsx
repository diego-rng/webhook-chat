"use client";
import { useEffect, useRef, useState } from "react";

interface Messages {
  value: string;
  origin: "Client" | "Server" | "Ping";
  userId?: string;
  timeSent: Date;
}

export default function Home() {
  const port = 8080;
  const [messages, setMessages] = useState<Messages[]>([]);
  const [ping, setPing] = useState<number | null>(null);
  const pendingPingRef = useRef<{ id: string; startedAt: number } | null>(null);
  const [area, setArea] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;

    function sendHeartbeat() {
      if (ws.readyState != WebSocket.OPEN || pendingPingRef.current !== null) {
        return;
      }

      const id = crypto.randomUUID();
      pendingPingRef.current = { id, startedAt: performance.now() };
      ws.send(JSON.stringify({ type: "latency-ping", id }));

      heartbeatTimeout = setTimeout(() => {
        if (pendingPingRef.current?.id === id) {
          pendingPingRef.current = null;
          setPing(null);
        }
      }, 3000);
    }
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("[Client] Connected.");
      ws.send(`Hello, this is the client`);
      setMessages((
        prev,
      ) => [...prev, {
        value: `Hello, this is the client`,
        origin: "Client",
        timeSent: new Date(),
      }]);
      sendHeartbeat();
      heartbeatInterval = setInterval(sendHeartbeat, 5000);
    };

    ws.onmessage = (event) => {
      let payload: { type?: string; id?: string } | null = null;

      try {
        payload = JSON.parse(String(event.data));
      } catch {
        payload = null;
      }

      if (payload?.type === "latency-pong") {
        const pending = pendingPingRef.current;

        if (pending?.id === payload.id) {
          setPing(Math.round(performance.now() - pending!.startedAt));
          pendingPingRef.current = null;

          if (heartbeatTimeout !== null) {
            clearTimeout(heartbeatTimeout);
            heartbeatTimeout = null;
          }
        }

        return;
      }

      console.log(`Received a message from the server: ${event.data}`);
      setMessages((
        prev,
      ) => [...prev, {
        value: event.data,
        origin: "Server",
        timeSent: new Date(),
      }]);
    };

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

  function sendMessage(message: string) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
      setMessages((
        prev,
      ) => [...prev, {
        value: message,
        origin: "Client",
        timeSent: new Date(),
      }]);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all p-2 bg-gray-900">
        <div className="min-w-300 max-h-200 overflow-scroll transition-all gap-2 mb-4 min-h-30 flex flex-col">
          {messages.map((message, index) => {
            return (
              <span key={index}>
                {message.timeSent.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} [{message.origin}] {message.value}
              </span>
            );
          })}
        </div>

        <div className="flex gap-2">
          <textarea
            className="bg-gray-950 flex"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && area.trim().length >= 1) {
                e.preventDefault();
                sendMessage(area);
                setArea("");
              }
            }}
          />
          <span> {ping === null ? "Latency: --" : `Latency: ${ping}ms`}</span>
        </div>
      </div>
    </div>
  );
}
