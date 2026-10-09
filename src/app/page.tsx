"use client";
import { Messages } from "@features/web-socket/types/Messages.ts";
import useClientConnection from "../features/web-socket/api/client-connection.ts";
import { useUserContext } from "../features/web-socket/hooks/userContext.tsx"

import { createContext, useContext, useRef, useState } from "react";
import Link from "next/link";

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
  const [messageTarget, setMessageTarget] = useState<Messages["target"]>(null);

  useClientConnection(
    port,
    pendingPingRef,
    useUserContext().userId,
    setPing,
    wsRef,
    setMessages,
    setActiveUsers,
  );

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 bg-gray-900">
        {activeUsers?.filter((u): u is string => !!u && u !== useContext(id))
          .map((u) => <Link href={`${u}/chat`} key={u}>{u}</Link>)}
      </div>
    </div>
  );
}
