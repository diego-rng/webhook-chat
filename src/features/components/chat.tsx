'use client';
import { useEffect, useRef, useState } from 'react';
import Messages from '../../types/Messages.ts';
import sendMessage from '../../features/web-socket/components/client-send.ts';
import useClientConnection from '../../features/web-socket/api/client-connection.ts';
import type User from '@/types/User.ts';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type Conversation from '../../types/Conversation.ts';

interface ChatProps {
  user: User | null;
  target: Conversation | null;
  messageHistory: Messages[];
  convMembers: User[];
}
export default function ChatPage({ user, target, messageHistory, convMembers }: ChatProps) {
  const port = 4000;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Messages[]>(messageHistory);
  useEffect(() => {
    if (user === null) router.push('/login');
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router, user]);
  const [activeUsers, setActiveUsers] = useState<Messages['userId'][] | null>(
    null,
  );
  const [ping, setPing] = useState<number | null>(null);
  const [area, setArea] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const pendingPingRef = useRef<{ userId: string; startedAt: number } | null>(
    null,
  );


  useClientConnection(
    port,
    pendingPingRef,
    user!.userId,
    setPing,
    wsRef,
    setActiveUsers,
    target!.conversationId,
    setMessages
  );

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 bg-gray-900">
        <div className="mb-2">
          <span className="font-bold text-2xl flex">
            {ping === null ? 'Server not connected' : 'Connected'}
          </span>
        </div>
        <div className="min-w-300 max-h-200 overflow-scroll transition-all gap-2 mb-4 min-h-30 flex flex-col-reverse">
          {messages.map((message, index) => {
            return (
              <span key={index} className="flex">
                {message.timeSent.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                [{message.origin === 'Server' ? 'Server' : convMembers.find((i) => i.userId === message.userId)?.username ?? 'Unknown'}]{' '}
                {message.value}{' '}
                <span className="justify-self-end ml-4 text-gray-500">
                  {message.seen ? 'Seen' : ''}
                </span>
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
              if (e.key === 'Enter' && !e.shiftKey && area.trim().length >= 1) {
                e.preventDefault();
                sendMessage(
                  area,
                  wsRef,
                  user!.username,
                  user!.userId,
                  target!.conversationId,
                  setMessages,
                );
                setArea('');
              }
            }}
          />
          <div className="flex flex-col">
            <span>Latency:</span>
            <span>{ping === null ? '--' : `${ping}ms`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
