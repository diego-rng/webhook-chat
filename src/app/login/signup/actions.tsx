'use server'
import bcrypt from "bcryptjs";
import { SignUpFunction, SignUpRes } from "../../../features/components/signup.tsx";
import { db } from "../../../prisma/db.ts";

export async function handleSignUp(user: SignUpFunction) {
    const res: SignUpRes = {}
    try {
      const res1 = await db.orm.public.User.create({
        active: true,
        username: user.username.trim(),
        email: user.email.trim(),
        name: user.name?.trim(),
      });

      if (!res1) throw new Error('Failed to create new User!')
      
      const res2 = await db.orm.public.UserCredentials.create({
        user_id: res1.id,
        username: user.username.trim(),
        password: bcrypt.hashSync(user.password.trim())
      })

      if (!res2) {
        await db.orm.public.User.where({ id: res1.id }).delete()
        throw new Error('Failed to create user Credentials!')
      }

      res.user = {
        active: true,
        username: user.username.trim(),
        name: user.name?.trim(),
        createdAt: new Date(res1.createdAt),
        updatedAt: new Date(res1.updatedAt),
        email: user.email.trim(),
        userId: res1.id
      }
      return res
    } catch (e) {
      console.error(`Error: ${e}`)
      res.error = e
      return res
    }
  }