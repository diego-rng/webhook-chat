'use client';
import { ChangeEvent, useEffect, useRef, useState} from 'react';
import Messages from '../../types/Messages.ts';
import sendMessage from '../../features/web-socket/components/client-send.ts';
import useClientConnection from '../../features/web-socket/api/client-connection.ts';
import type User from '@/types/User.ts';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type Conversation from '../../types/Conversation.ts';
import changeConversationName from './changeConversationName.tsx';
import Link from 'next/link';
import deleteConversation from './deleteConversation.tsx';

interface ChatProps {
  user: User | null;
  target: Conversation | null;
  messageHistory: Messages[];
  convMembers: User[];
}
export default function ChatPage({
  user,
  target,
  messageHistory,
  convMembers,
}: ChatProps) {
  const port = 4000;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Messages[]>(messageHistory);
  useEffect(() => {
    if (user === null) router.push('/login');
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router, user]);
  const [_activeUsers, setActiveUsers] = useState<Messages['userId'][] | null>(
    null,
  );
  const [conversationModalActive, setConversationModalActive] =
    useState<boolean>(true);
  const [imageModalActive, setImageModalActive] = useState<boolean>(true);
  const [imageModal, setImageModal] = useState<string | undefined>(undefined);
  const [ping, setPing] = useState<number | null>(null);
  const [area, setArea] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const pendingPingRef = useRef<{ userId: string; startedAt: number } | null>(
    null,
  );
  const [conversationName, setConversationName] = useState<string>(
    target?.conversationName ?? '',
  );
  const [conversationError, setConversationError] = useState<string>('');
  const [deleteModalActive, setDeleteModalActive] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const selectedFile = files[0];

    const reader = new FileReader();

    reader.onload = () => {
      sendMessage(
        reader.result as string,
        wsRef,
        user!.username,
        user!.userId,
        target!.conversationId,
        setMessages,
      );
    };

    reader.readAsDataURL(selectedFile);
  }

  const messageClass = (check: boolean) => {
    if (check === true) return ' bg-dark-purple ';
    else return ' bg-light-gray ';
  };

  const clickRef = () => {
    inputRef.current?.click();
  };

  const parseImage = (image: string) => {
    return (
      <img
        src={image}
        className="max-h-30 max-w-30 cursor-pointer"
        onClick={() => {
          setImageModal(image);
          setImageModalActive(false);
        }}
      />
    );
  };

  async function handleConversationChange() {
    const res = await changeConversationName(
      target!.conversationId,
      conversationName!,
    );
    if (!res) setConversationError('An Error occurred!');
    setConversationModalActive(true);
    setTimeout(() => {
      router.refresh();
    }, 100);
  }

  async function handleDeleteConversation() {
    await deleteConversation(target!.conversationId);
    router.push('/');
  }


  
  useClientConnection(
    port,
    pendingPingRef,
    user!.userId,
    setPing,
    wsRef,
    setActiveUsers,
    target!.conversationId,
    setMessages,
  );

  return (
    <div className="flex justify-center items-center h-screen transition-all">
      <div className="transition-all flex flex-col p-2 bg-linear-to-br from-items via-items to-dark-purple rounded-3xl">
        <div className="flex flex-row mt-2 justify-between">
          <div className="mb-2 flex">
            <span className="font-bold text-2xl flex">
              {ping === null
                ? 'Server not connected'
                : `Connected - ${target?.conversationName ?? target?.conversationId}`}
            </span>
            <button
              type="button"
              className="ml-2 p-2 bg-dark-purple rounded-full cursor-pointer"
              onClick={() => setConversationModalActive(false)}
            >
              Change Conversation Name
            </button>
            <button
              type="button"
              className="ml-2 p-2 bg-dark-purple rounded-full cursor-pointer"
              onClick={() => setDeleteModalActive(false)}
            >
              Delete conversation
            </button>
          </div>
          <Link
            href="/"
            className="p-2 bg-dark-purple rounded-full h-fit text-center justify-center"
          >
            Home
          </Link>
        </div>
        <div className="w-[90vw] h-[80vh] overflow-scroll transition-all gap-2 mb-4 flex flex-col-reverse">
            {messages.map((message, index) => {
              return (
                <div key={index}>
                  <span className="flex">
                    {message.origin === 'Server' ? (
                      '[Server]'
                    ) : convMembers.find((i) => i.userId === message.userId)
                        ?.username ? (
                      <span className="mr-2 font-semibold text-lg">
                        {
                          convMembers.find((i) => i.userId === message.userId)
                            ?.username
                        }
                      </span>
                    ) : (
                      'Unknown'
                    )}{' '}
                    {message.timeSent.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                  </span>
                  <div
                    className={
                      messageClass(message.userId === user?.userId) +
                      'flex flex-col w-fit p-2 rounded-2xl'
                    }
                  >
                    <span className="">
                      {isImage(message.value)
                        ? parseImage(message.value!)
                        : message.value}
                    </span>
                    <span className="text-gray-500">
                      {message.seen ? 'Cached' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="flex gap-2">
          <textarea
            className="bg-light-gray min-w-[90%] rounded-4xl rounded-br-none flex"
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
          <input
            type="file"
            onChange={(event) => handleImage(event)}
            className="opacity-0 w-0 h-0 absolute -z-1"
            ref={inputRef}
            accept="image/png, image/jpeg"
          />
          <button
            type="button"
            className="p-2 bg-light-gray rounded-full"
            onClick={clickRef}
          >
            +
          </button>
          <div className="flex flex-col">
            <span>Latency:</span>
            <span>{ping === null ? '--' : `${ping}ms`}</span>
          </div>
        </div>
      </div>
      <div
        hidden={imageModalActive}
        className="bg-black/50 flex flex-col justify-center items-center h-screen w-screen absolute"
      >
        <div
          className="h-screen w-screen absolute z-1"
          onClick={() => setImageModalActive(true)}
        />
        <img src={imageModal} className="max-w-[90vw] max-h-[90vh] z-2"></img>
      </div>
      <div
        hidden={conversationModalActive}
        className="bg-black/50 flex flex-col justify-center items-center h-screen w-screen absolute"
      >
        <div
          className="h-screen w-screen absolute z-1"
          onClick={() => setConversationModalActive(true)}
        />
        <div className="flex flex-col items-center justify-center rounded-4xl border border-gray-700 text-center p-5 pt-7 bg-items gap-2 z-2">
          <div className="flex flex-col gap-1">
            <label>Conversation Name</label>
            <input
              type="text"
              value={conversationName}
              className="bg-light-gray px-3 rounded-full border border-gray-600"
              onChange={(e) => setConversationName(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  conversationName.trim().length >= 1
                ) {
                  e.preventDefault();
                  handleConversationChange();
                }
              }}
            />
          </div>
          {conversationError.length >= 1 && (
            <span className="m-2">{conversationError}</span>
          )}
          <button
            type="button"
            className="border border-gray-700 bg-dark-purple rounded-full px-2 py-1 cursor-pointer"
            onClick={handleConversationChange}
          >
            Submit
          </button>
        </div>
      </div>
      <div
        hidden={deleteModalActive}
        className="bg-black/50 flex flex-col justify-center items-center h-screen w-screen absolute"
      >
        <div
          className="h-screen w-screen absolute z-1"
          onClick={() => setDeleteModalActive(true)}
        />
        <div className="flex flex-col items-center justify-center rounded-4xl border border-gray-700 text-center p-5 pt-7 bg-items gap-2 z-2">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-2xl">
              <span className="text-red-500">Delete</span> Conversation?
            </label>
            <span className="text-sm text-gray-500">
              (This cannot be undone!)
            </span>
            <div className="flex flex-row self-center gap-2">
              <button
                type="button"
                className="px-2 py-1 font-semibold cursor-pointer text-white bg-red-700 border border-gray-500 rounded-full "
                onClick={handleDeleteConversation}
              >
                Yes
              </button>
              <button
                type="button"
                className="px-2 py-1 font-semibold cursor-pointer bg-light-gray border border-gray-500 rounded-full "
                onClick={() => setDeleteModalActive(true)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function isImage(value: string | null | undefined) {
  return !!value && value.startsWith('data:image/');
}

