import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {label: 'Username', type: "text", placeholder: 'admin'},
        password: {label: 'Password', type: "password"}
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await db.orm.public.UserCredentials.where({ username: credentials?.username}).first()

        if (!user) return null; 

        const ok = await bcrypt.compare(credentials.password, user.password)
        if (!ok) return null;
        
        return {
          id: String(user.user_id),
          name: user.username
        }
      }
    })
  ]
})

export default handler