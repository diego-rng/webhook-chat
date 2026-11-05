'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type User from '@/types/User.ts';
import { Char } from '@prisma/orm-postgres/target/codec-types';
import handleAddConversation from './addConversation.tsx';

type HomePageProps = {
  user: User | null;
  db: {
    users:
      | {
          id: string & {
            readonly __charLength: 36;
          };
          email: string;
          active: boolean;
          createdAt: string;
          name: string | null;
          updatedAt: string;
          username: string;
          participating_conversations: {
            id: Char<36>;
            conversation_id: string;
            user_id: string;
          }[];
        }
      | {
          id: string & {
            readonly __charLength: 36;
          };
          email: string;
          active: boolean;
          createdAt: string;
          name: string | null;
          updatedAt: string;
          username: string;
          participating_conversations: {
            id: Char<36>;
            conversation_id: string;
            user_id: string;
          }[];
        }[]
      | null
      | undefined;
    conversations:
      | {
          id: string & {
            readonly __charLength: 36;
          };
          conversation_name: string | null;
          created_by: string;
          author: {
            id: Char<36>;
            email: string;
            active: boolean;
            createdAt: string;
            name: string | null;
            updatedAt: string;
            username: string;
          };
          participants: {
            id: Char<36>;
            conversation_id: string;
            user_id: string;
          }[];
        }[]
      | undefined;
    messages:
      | {
          id: Char<36>;
          content: string;
          conversation_id: string;
          attachment: string | null;
          sent_by: string;
        }[]
      | undefined;
    convos: {
      id: string & {
        readonly __charLength: 36;
      };
      user_id: string;
      conversation_id: string;
      conversation: {
        id: Char<36>;
        created_by: string;
        conversation_name: string | null;
      };
    }[];
  };
};

export default function HomePage({ user, db }: HomePageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _session, status } = useSession();
  const [addActive, setAddActive] = useState<boolean>(true);
  const [addUsername, setAddUsername] = useState<string>('');
  const router = useRouter();
  useEffect(() => {
    if (user === null) router.push('/login');
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router, user]);

  const userConversations = db!.convos;

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 rounded-3xl bg-linear-to-br from-items via-items to-dark-purple h-[80vh] w-[80vw]">
        <div className="flex justify-between mt-2">
          <h1 className="mx-3 text-2xl font-bold">Welcome back!</h1>
          <button
            type="button"
            className="p-2 bg-red-600 rounded-full text-white cursor-pointer"
            onClick={() => {
              signOut();
            }}
          >
            Sign Out
          </button>
        </div>
        <div className="flex flex-col">
          {userConversations && userConversations.length >= 1
            ? userConversations.map((u) => (
                <Link
                  href={`${u.conversation_id}/chat`}
                  className="border border-gray-700 bg-linear-to-r from-light-gray to-dark-purple rounded-full px-2 py-2 mx-2"
                  key={u.conversation_id}
                >
                  {u.conversation.conversation_name} - {u.conversation_id}
                </Link>
              ))
            : ''}
          <button
            type="button"
            className="cursor-pointer px-2 bg-linear-to-r from-light-gray to-dark-purple border border-gray-700 rounded-full"
            onClick={() => setAddActive(false)}
          >
            +
          </button>
        </div>
      </div>
      <div
        hidden={addActive}
        className="bg-black/50 flex flex-col justify-center items-center h-screen w-screen absolute"
      >
        <div
          className="h-screen w-screen absolute z-1"
          onClick={() => setAddActive(true)}
        />
        <div className="h-[30vh] flex flex-col items-center text-left w-[25vw] p-5 pt-7 bg-gray-700 gap-2 z-2">
          <span className="text-3xl font-bold">Add connection</span>
          <label>Username</label>
          <input
            type="text"
            className="bg-black"
            value={addUsername}
            onChange={(e) => setAddUsername(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                addUsername.trim().length >= 1
              ) {
                e.preventDefault();
                handleAddConversation(user!.userId, addUsername);
                setAddUsername('');
              }
            }}
          />
          <button
            type="button"
            onClick={() => handleAddConversation(user!.userId, addUsername)}
          >
            Add conversation
          </button>
        </div>
      </div>
    </div>
  );
}
