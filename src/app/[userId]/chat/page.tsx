import ChatPage from "@/features/components/chat.tsx";
import { authOptions } from "@/lib/auth.ts";
import { db } from "@/prisma/db.ts";
import User from "@/types/User.ts";
import { Char } from "@prisma/orm-postgres/target/codec-types";
import { getServerSession } from "next-auth";
import Providers from '@features/components/providers.tsx';
import { redirect } from "next/navigation";
import Conversation from "../../../types/Conversation.ts";

export default async function Chat({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user.username) redirect('/login')
  
  const userTemp = await db.orm.public.UserCredentials.where({
    username: session.user.username,
  }).first(); 

  if (!userTemp) redirect('/login');

  const userInfo = await db.orm.public.User.where({
    id: userTemp.user_id as Char<36>,
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

  const targetConversation = await db.orm.public.Conversation.where({id: slug as Char<36>}).first()
  const targetMembers = await db.orm.public.ConversationParticipant.where({conversation_id: slug as Char<36>}).all()

  const target: Conversation = {
    conversationId: slug,
    conversationName: targetConversation!.conversation_name,
    conversationCreator: targetConversation!.created_by,
    conversationMembers: targetMembers
  }

  return (
    <Providers session={session}>
      <ChatPage user={user ?? null} target={target} />
    </Providers>
  )
}