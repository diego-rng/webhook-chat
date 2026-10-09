"use client";
import { useEffect, useRef, useState } from "react";
import { Messages } from "@features/web-socket/types/Messages.ts";
import { onClientOpen } from "../features/web-socket/components/client-open.ts";
import onClientMessage from "../features/web-socket/components/client-message.ts";
import sendMessage from "../features/web-socket/components/client-send.ts";

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
    ws.onopen = () => onClientOpen(ws, id, setMessages, sendHeartbeat, heartbeatTimeout)

    ws.onmessage = (event) => onClientMessage(event, pendingPingRef, setPing, heartbeatTimeout, setActiveUsers, setMessages)

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
              <span key={index} className="flex">
                {message.timeSent.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} [{message.origin}] {message.value} <span className="justify-self-end ml-4 text-gray-500">{message.seen ? "Seen" : ''}</span>
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
                sendMessage(area, wsRef, id, messageTarget, setMessages);
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
