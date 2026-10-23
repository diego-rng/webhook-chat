'use server'
import { db } from '@/prisma/db.ts';
import Providers from '@features/components/providers.tsx';
import HomePage from '@features/components/home.tsx';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.ts';
import { redirect } from 'next/navigation';
import User from '@/types/User.ts';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
import handleDBConnection from "../features/web-socket/api/db-connection.ts";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.username) {
    redirect('/login');
  }

  const userTemp = await db.orm.public.UserCredentials.where({
    username: session.user.username,
  }).first();

  if (!userTemp) redirect('/login');

  const userInfo = await db.orm.public.User.where({
    id: userTemp.user_id as Char<36>,
  }).first();

  if (!userInfo) redirect('/login')

  const conversations = handleDBConnection({users: {id: session.user.user_id}})

  const user: User = {
    userId: userTemp.user_id,
    username: userTemp.username,
    name: userInfo.name!,
    active: userInfo.active,
    createdAt: new Date(userInfo.createdAt),
    updatedAt: new Date(userInfo.updatedAt),
    email: userInfo.email,
  };

  return (
    <Providers session={session}>
      <HomePage user={user ?? null} db={conversations} />
    </Providers>
  );
}
