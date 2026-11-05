'use server'

import { db } from "../../prisma/db.ts";

export default async function changeConversationName(conversationId: string & {readonly __charLength: 36}, newName: string) {
  const res = await db.orm.public.Conversation.where({id: conversationId}).update({conversation_name: newName})
  return res
}