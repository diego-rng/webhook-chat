import { db } from '@/prisma/db';
import { SessionProvider } from 'next-auth/react';
import HomePage from '@/features/components/home';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.username) {
    redirect('/login');
  }

  const user = await db.orm.public.UserCredentials.where({
    username: session.user.username,
  }).first();

  return (
    <SessionProvider session={session}>
      <HomePage user={user ?? null} />
    </SessionProvider>
  );
}
