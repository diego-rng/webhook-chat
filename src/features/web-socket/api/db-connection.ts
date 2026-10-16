import { db } from "@prisma/db.ts"

export default async function handleDBConnection(filters: {users?: {from?: string, to?: string, in?: Date[] | Date}, conversations?: {}, messages?: {}, conversationParticipants?: {}} | null = null) { 
  if (filters) {
    
  } else {
    const users = await db.orm.public.User.all();
    const conversations = await db.orm.public.Conversation.all();
    const messages = await db.orm.public.Message.all();
    const conversationParticipants = await db.orm.public.ConversationParticipant.all()

    return { users, conversations, messages, conversationParticipants }
  }
}