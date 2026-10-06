"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const port = 8080;
  const [messages, setMessages] = useState<string[]>([]);
  const [area, setArea] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("[Client] Connected.");
      ws.send(`Hello, this is the client`);
    };

    ws.onmessage = (event) => {
      console.log(`Received a message from the server: ${event.data}`);
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error(error);
    };

    console.log(`Listening at ${port}`);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [messages, setMessages]);

  function sendMessage(message: string) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
      console.log(messages);
    }
  }

  return (
    <div className="justify-self-center place-self-center p-2 bg-gray-900">
      <div className="min-w-30 min-h-30">
        {messages.map((message, index) => {
          return <span key={index}>{message}</span>;
        })}
      </div>

      <textarea
        className="bg-gray-950"
        onChange={(e) => {
          setArea(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && area.length >= 1) {
            sendMessage(area);
          }
        }}
      />
    </div>
  );
}
