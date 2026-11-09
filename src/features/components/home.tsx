'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type User from '@/types/User.ts';
import { Char } from '@prisma/orm-postgres/target/codec-types';
import handleAddConversation from '../actions/addConversation.ts';
import AsyncCreatableSelect from 'react-select/async-creatable'

type HomePageProps = {
  user: User | null;
  db: {
    users:
      | {
          id: string & {
            readonly __charLength: 36;
          };
          active: boolean;
          createdAt: string;
          email: string;
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
          active: boolean;
          createdAt: string;
          email: string;
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
          conversation_id: string;
          attachment: string | null;
          content: string;
          sent_by: string;
          sent_time: Temporal.Instant;
        }[]
      | undefined;
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
  const [addError, setAddError] = useState<string>('');

  const userConversations = db!.conversations;

  const convoFunction = async (
    userId: string & { readonly __charLength: 36 },
    addUsername: string,
  ) => {
    const res:
      | string
      | { conversation_name: string | null; created_by: string; id: Char<36> } =
      await handleAddConversation(userId, addUsername);
    if (!res) setAddError('An unexpected error happened!');
    if (res && typeof res === 'string') {
      setAddError(res);
    }
    if (res && typeof res !== 'string') {
      router.push(`/${res.id}/chat`);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 rounded-3xl bg-linear-to-br from-items via-items to-dark-purple h-[80vh] w-[80vw]">
        <div className="flex justify-between m-3">
          <h1 className="text-2xl font-bold">
            Welcome back, {user!.username}!
          </h1>
          <div>
            <button
              type="button"
              className="cursor-pointer border border-gray-700 bg-dark-purple rounded-full p-2 px-6 mx-2"
              onClick={() => setAddActive(false)}
            >
              +
            </button>
            <button
              type="button"
              className="p-2 bg-red-600 rounded-full h-fit text-white cursor-pointer"
              onClick={() => {
                signOut();
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {userConversations && userConversations.length >= 1
            ? userConversations.map((u) => (
                <Link
                  href={`${u.id}/chat`}
                  className="border border-gray-700 bg-linear-to-r from-light-gray to-dark-purple rounded-full px-2 py-2 mx-2"
                  key={u.id}
                >
                  {u.conversation_name ?? 'Unnamed Conversation'} -{' '}
                  {u.id}
                </Link>
              ))
            : ''}
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
        <div className="h-[30vh] flex flex-col items-center text-left w-[25vw] p-5 pt-7 bg-items border border-gray-700 rounded-4xl gap-2 z-2">
          <span className="text-3xl font-bold">Add connection</span>
          <label className="mt-5">Username</label>
          <input  
            type="text"
            className="bg-light-gray border px-3 border-gray-600 rounded-full"
            value={addUsername}
            onChange={(e) => setAddUsername(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                addUsername.trim().length >= 1
              ) {
                e.preventDefault();
                convoFunction(
                  user!.userId as string & { readonly __charLength: 36 },
                  addUsername,
                );
              }
            }}
          />
          {addError.length >= 1 && <span className="text-red-600">{addError}</span>}
          <button
            type="button"
            className="p-2 bg-dark-purple rounded-full border border-gray-700 cursor-pointer"
            onClick={() =>
              convoFunction(
                user!.userId as string & { readonly __charLength: 36 },
                addUsername,
              )
            }
          >
            Add conversation
          </button>
        </div>
      </div>
    </div>
  );
}
