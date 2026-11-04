'use server'
import { db } from "../../prisma/db.ts"
import type Messages from "../../types/Messages.ts";

export default async function pullHistory(
  conversationId: string & {readonly __charLength: 36}
) {
  const res = await db.orm.public.Message.where({conversation_id: conversationId}).orderBy((u) => u.sent_time.desc()).all()

  const conversation: Messages[] = res.map((i) => ({
      messageId: i.id as string & {readonly __charLength: 36},
      origin: 'Client',
      timeSent: new Date(i.sent_time.epochMilliseconds),
      seen: true,
      target: i.conversation_id,
      type: (i.attachment ? 'Image' : 'Text'),
      userId: i.sent_by,
      value: i.content
    }))

  return conversation;
}