import { db } from "@prisma/db.ts"
import type { Char } from '@prisma/orm-postgres/target/codec-types'

export default async function handleDBConnection(filters: {users?: {id?: string, createdAt?: string}, conversations?: {participants: string[]}, messages?: {from?: string, relatedConversation?: string}} | null = null) {
  if (filters) {
    if (filters.users) {
      const id = filters.users.id;
      const createdAt = filters.users.createdAt
      
      switch (filters.users) {
        case (filters.users.id && filters.users.createdAt): {
          const users = await db.orm.public.User.where({ id: id as Char<36>, createdAt: createdAt }).include("participating_conversations").all();
          return { users }
        }
        case (filters.users.id): {
        const users = await db.orm.public.User.where({ id: id as Char<36> }).include("participating_conversations").first()
        return { users }
        }
        case (filters.users.createdAt): {
        const users = await db.orm.public.User.where({ createdAt: createdAt }).include("participating_conversations").all()
        return { users }
        }
      }
    } else if (filters.messages) {
      const from = filters.messages.from;
      const relatedConversation = filters.messages.relatedConversation;

      switch (filters.messages) { 
        case (filters.messages.from && filters.messages.relatedConversation): {
          const messages = await db.orm.public.Message.where({sent_by: from as Char<36>, conversation_id: relatedConversation}).all()
          return { messages }
        }
        case (filters.messages.from): {
          const messages = await db.orm.public.Message.where({sent_by: from as Char<36>}).all();
          return { messages }
        }
        case (filters.messages.relatedConversation): {
          const messages = await db.orm.public.Message.where({conversation_id: relatedConversation}).all();
          return { messages }
        }
      }
    } else if (filters.conversations?.participants) {
      const participants = filters.conversations.participants as Char<36>[];

      const conversations = await db.orm.public.Conversation.include("participants").where((a) => a.participants.some((t) => t.user_id.in(participants))).all();
      return { conversations };
    }
  } else {
    const users = await db.orm.public.User.include("created_conversations").include("participating_conversations").all();
    const conversations = await db.orm.public.Conversation.include("author").include("participants").all();
    const messages = await db.orm.public.Message.all();
    const participants = await db.orm.public.ConversationParticipant.all();

    return { users, conversations, messages, participants }
  }
}
