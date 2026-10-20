import { db } from '@/prisma/db';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  theme: { colorScheme: 'dark' },
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'admin' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await db.orm.public.UserCredentials.where({
          username: credentials?.username,
        }).first();

        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: String(user.user_id),
          user_id: String(user.user_id),
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.user_id = user.user_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.username = token.username;
      session.user.user_id = token.user_id;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
