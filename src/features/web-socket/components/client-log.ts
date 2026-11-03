'use server'
import { db } from "../../../prisma/db.ts"
import Messages from "../../../types/Messages.ts";

export default async function logMessage(
  payload: Messages,
  conversationId: string
) {
  await db.orm.public.Message.create({
    content: JSON.stringify(payload.value!),
    conversation_id: conversationId,
    sent_by: payload.userId,
  })
}