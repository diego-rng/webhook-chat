import ChatPage from '@/features/components/chat.tsx';
import { authOptions } from '@/lib/auth.ts';
import { db } from '@/prisma/db.ts';
import User from '@/types/User.ts';
import { getServerSession } from 'next-auth';
import Providers from '@features/components/providers.tsx';
import { redirect } from 'next/navigation';
import Conversation from '../../../types/Conversation.ts';
import pullHistory from '../../../features/actions/pullConversation.ts';
import lookUpMembers from "../../../features/actions/lookUpMembers.ts";

export default async function Chat({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user.username) redirect('/login');

  const userTemp = await db.orm.public.UserCredentials.where({
    username: session.user.username,
  }).first();

  if (!userTemp) redirect('/login');

  const userInfo = await db.orm.public.User.where({
    id: userTemp.user_id as string & { readonly __charLength: 36 },
  }).first();

  const user: User = {
    userId: userTemp!.user_id,
    username: userTemp.username,
    name: userInfo!.name!,
    active: userInfo!.active,
    createdAt: new Date(userInfo!.createdAt),
    updatedAt: new Date(userInfo!.updatedAt),
    email: userInfo!.email,
  };

  const targetConversation = await db.orm.public.Conversation.where({
    id: userId as string & { readonly __charLength: 36 },
  }).first();
  const targetMembers = await db.orm.public.ConversationParticipant.where({
    conversation_id: userId as string & { readonly __charLength: 36 },
  }).all();

  const target: Conversation = {
    conversationId: targetConversation!.id as string & {readonly __charLength: 36},
    conversationName: targetConversation!.conversation_name,
    conversationCreator: targetConversation!.created_by,
    conversationMembers: targetMembers,
  };

  const messageHistory = await pullHistory(target!.conversationId as string & {readonly __charLength: 36});

  const convMembers = await lookUpMembers(target!.conversationId as string & {readonly __charLength: 36});

  return (
    <Providers session={session}>
      <ChatPage user={user ?? null} target={target} messageHistory={messageHistory} convMembers={convMembers} />
    </Providers>
  );
}
