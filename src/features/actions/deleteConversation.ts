'use server'

import { db } from "../../prisma/db.ts";

export default async function deleteConversation(conversationId: string) {
  await db.orm.public.ConversationParticipant.where({conversation_id: conversationId}).deleteAll()

  await db.orm.public.Message.where({conversation_id: conversationId}).deleteAll();

  await db.orm.public.Conversation.where({id: conversationId as string & {readonly __charLength: 36}}).delete();
}