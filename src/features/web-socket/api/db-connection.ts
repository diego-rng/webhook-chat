import { db } from '@prisma/db.ts';
import type { Char } from '@prisma/orm-postgres/target/codec-types';

export default async function handleDBConnection(
  filters: {
    users?: { id?: string; createdAt?: string };
    conversations?: { member: string[] };
    parts: string;
  } | null = null,
) {
  let users;
  let conversations;
  let messages;
  let convos;
  if (filters) {
    if (filters.users) {
      const id = filters.users.id;
      const createdAt = filters.users.createdAt;

      switch (filters.users) {
        case filters.users.id && filters.users.createdAt: {
          users = await db.orm.public.User.where({
            id: id as Char<36>,
            createdAt: createdAt,
          })
            .include('participating_conversations')
            .all();
          break;
        }
        case filters.users.id: {
          users = await db.orm.public.User.where({ id: id as Char<36> })
            .include('participating_conversations')
            .first();
          break;
        }
        case filters.users.createdAt: {
          users = await db.orm.public.User.where({ createdAt: createdAt })
            .include('participating_conversations')
            .all();
          break;
        }
      }
    } else if (filters.parts) {
      convos = await db.orm.public.ConversationParticipant.where({
        user_id: filters.parts,
      })
        .include('conversation')
        .all();
    }
  } else {
    users = await db.orm.public.User.include('created_conversations')
      .include('participating_conversations')
      .all();
    conversations = await db.orm.public.Conversation.include('author')
      .include('participants')
      .all();
    messages = await db.orm.public.Message.all();
    convos = await db.orm.public.ConversationParticipant.all();
  }
  return { users, conversations, messages, convos };
}
