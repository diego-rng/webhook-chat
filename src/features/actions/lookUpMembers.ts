'use server'
import { db } from "../../prisma/db.ts"
import type User from "../../types/User.ts";

export default async function lookUpMembers(
  conversationId: string & {readonly __charLength: 36}
) {
  const res = await db.orm.public.ConversationParticipant.where({conversation_id: conversationId}).all()

  const members: User[] = []

  for (const i of res) {
    const ret = await db.orm.public.User.where({id: i.user_id as string & {readonly __charLength: 36}}).first()
    if (!ret) continue
    const mem: User = {
      username: ret.username,
      userId: ret.id,
      active: true,
      createdAt: new Date(ret.createdAt),
      updatedAt: new Date(ret.updatedAt),
      email: ret.email,
    }
    members.push(mem)
  }

  return members
}