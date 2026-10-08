"use client";
import { useEffect, useRef, useState } from "react";

export interface Messages {
  value?: string;
  origin: "Client" | "Server";
  userId?: string;
  messageId: string;
  timeSent: Date;
  type?: string;
  target?: string | null;
  seen?: boolean;
}

export default function Home() {
  const port = 8080;
  const [messages, setMessages] = useState<Messages[]>([]);
  const [ping, setPing] = useState<number | null>(null);
  const pendingPingRef = useRef<{ userId: string; startedAt: number } | null>(
    null,
  );
  const [area, setArea] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const [activeUsers, setActiveUsers] = useState<Messages["userId"][] | null>(
    null,
  );
  const [id] = useState(() => crypto.randomUUID());
  const [messageTarget, setMessageTarget] = useState<Messages["target"]>(null);

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
    ws.onopen = () => {
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
    };

    ws.onmessage = (event) => {
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
        const index = messages.findIndex((a) => a.messageId === payload.messageId)
        if (index) {
          messages[index].seen = true
        }
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

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 bg-gray-900">
        <div className="mb-2">
          <span className="font-bold text-2xl flex">
            {ping === null ? "Server not connected" : "Connected"}
          </span>

          <div>
            {activeUsers?.filter((u): u is string => !!u && u !== id).map((
              u,
            ) => (
              <button
                type="button"
                onClick={() => setMessageTarget(u)}
                className="bg-gray-600 px-1 py-0.5"
                key={u}
              >
                {u.slice(0, 8)}
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-300 max-h-200 overflow-scroll transition-all gap-2 mb-4 min-h-30 flex flex-col">
          {messages.map((message, index) => {
            return (
              <span key={index}>
                {message.timeSent.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} [{message.origin}] {message.value} <span className="justify-self-end">{message.seen ? "Seen" : ''}</span>
              </span>
            );
          })}
        </div>

        <div className="flex gap-2">
          <textarea
            className="bg-gray-950 min-w-200 flex"
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
          <div className="flex flex-col">
            <span>Latency:</span>
            <span>{ping === null ? "--" : `${ping}ms`}</span>
          </div>

          <div className="flex flex-col">
            <span>Active Users:</span>
            <div className="flex  gap-2">
              {activeUsers?.filter((u): u is string => !!u && u !== id).map((
                u,
              ) => <span key={u}>{u.slice(0, 8)}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
