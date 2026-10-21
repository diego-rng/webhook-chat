import ChatPage from "@/features/components/chat";
import { authOptions } from "@/lib/auth";
import { db } from "@/prisma/db";
import User from "@/types/User";
import { Char } from "@prisma/orm-postgres/target/codec-types";
import { getServerSession } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function Chat() {
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

  return (
    <SessionProvider session={session}>
      <ChatPage user={user ?? null} />
    </SessionProvider>
  )
}