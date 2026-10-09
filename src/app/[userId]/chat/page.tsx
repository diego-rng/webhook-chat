'use client'
import { use, useContext, useRef, useState } from 'react'
import { Messages } from "../../../features/web-socket/types/Messages.ts";
import sendMessage from "../../../features/web-socket/components/client-send.ts";
import { id } from "../../page.tsx";
import useClientConnection from "../../../features/web-socket/api/client-connection.ts";

export default function chatPage({params}: {params: Promise<{ userId: string }>}) {
  const { userId } = use(params);
  const port = 8080
  const [messages, setMessages] = useState<Messages[]>([]);
  const [activeUsers, setActiveUsers] = useState<Messages["userId"][] | null>(null) 
  const [ping, setPing] = useState<number | null>(null)
  const [area, setArea] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useContext(id)
  const pendingPingRef = useRef<{userId: string, startedAt: number} | null>(null)
  
  useClientConnection(
    port, 
    pendingPingRef,
    clientId,
    setPing, 
    wsRef,
    setMessages,
    setActiveUsers
  )
  
  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 bg-gray-900">
        <div className="mb-2">
          <span className="font-bold text-2xl flex">
            {ping === null ? "Server not connected" : "Connected"}
          </span>

          <div>
            {activeUsers?.filter((u): u is string => !!u && u !== clientId).map((
              u,
            ) => (
              <button
                type="button"
                
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
                sendMessage(area, wsRef, clientId, userId, setMessages);
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
              {activeUsers?.filter((u): u is string => !!u && u !== clientId).map((
                u,
              ) => <span key={u}>{u.slice(0, 8)}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}