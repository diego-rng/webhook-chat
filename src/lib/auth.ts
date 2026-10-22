import { db } from '@/prisma/db.ts';
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
        console.log(`authorize called! ${credentials?.username}`)
        try {
          if (!credentials) return null;
          const user = await db.orm.public.UserCredentials.where({
            username: credentials?.username,
          }).first();
          
          console.log(`user found! ${!!user}`)
          
          if (!user) return null;
  

          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) return null;
  
          return {
            id: String(user.user_id),
            user_id: String(user.user_id),
            username: user.username,
          };

        } catch (e) {
          console.error(`authorize error: ${e}`)
          return null;
        }
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
