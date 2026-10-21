'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Messages from '../../types/Messages';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useClientConnection from '../web-socket/api/client-connection';
import type User from '@/types/User';

type HomePageProps = {
  user: User | null;
};

export default function HomePage({ user }: HomePageProps) {
  const port = 8080;
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
  if (status === 'unauthenticated') router.push('/login');
}, [status, router]);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [ping, setPing] = useState<number | null>(null);
  const pendingPingRef = useRef<{ userId: string; startedAt: number } | null>(
    null,
  );
  const wsRef = useRef<WebSocket | null>(null);
  const [activeUsers, setActiveUsers] = useState<Messages['userId'][] | null>(
    null,
  );

  useClientConnection(
    port,
    pendingPingRef,
    user!.userId,
    setPing,
    wsRef,
    setMessages,
    setActiveUsers,
  );

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 bg-gray-900">
        {activeUsers
          ?.filter((u): u is string => !!u && u !== user!.userId)
          .map((u) => (
            <Link href={`${u}/chat`} key={u}>
              {u}
            </Link>
          ))}
      </div>
    </div>
  );
}
