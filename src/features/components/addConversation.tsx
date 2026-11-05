'use server';
import { db } from '../../prisma/db.ts';

async function handleAddConversation(userId: string, targetName: string) {
  try {
    const target = await db.orm.public.User.where({
      username: targetName,
    }).first();

    if (!target) throw new Error('user not found!');

    const res = await db.orm.public.Conversation.create({ created_by: userId });
    
    if (!res)
      throw new Error('conversation not created, something went wrong!');
    
    const res1 = await db.orm.public.ConversationParticipant.create({
      user_id: userId,
      conversation_id: res.id,
    });
    if (!res1) throw new Error('failed to create conversation!');
    const res2 = await db.orm.public.ConversationParticipant.create({
      user_id: target.id,
      conversation_id: res.id,
    });
    if (!res2) throw new Error('failed to create conversation!');
  } catch (err) {
    console.error(err);
  }
}

export default handleAddConversation;
