'use server'
import { db } from "../../prisma/db.ts";

async function handleAddConversation(userId: string, targetId: string) {
  const res = await db.orm.public.Conversation.create({ created_by: userId });

  if (!res) return;

  await db.orm.public.ConversationParticipant.create({
    conversation_id: res.id,
    user_id: userId,
  });
  await db.orm.public.ConversationParticipant.create({
    conversation_id: res.id,
    user_id: targetId,
  });
}

export default handleAddConversation