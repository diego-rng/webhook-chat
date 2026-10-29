'use server';
import { db } from '../../prisma/db.ts';

async function handleAddConversation(userId: string, targetName: string) {
  try {
    console.log('finding user...');
    const target = await db.orm.public.User.where({
      username: targetName,
    }).first();

    if (!target) throw new Error('user not found!');

    console.log('user found!');
    console.log('creating conversation');

    const res = await db.orm.public.Conversation.create({ created_by: userId });
    
    if (!res)
      throw new Error('conversation not created, something went wrong!');
    
    console.log('conversation created!');
    console.log(JSON.stringify(res))

    const res1 = await db.orm.public.ConversationParticipant.create({
      user_id: userId,
      conversation_id: res.id,
    });
    if (!res1) throw new Error('failed to create conversation!');
    console.log(JSON.stringify(res1))
    console.log('participant 1 created!')
    const res2 = await db.orm.public.ConversationParticipant.create({
      user_id: target.id,
      conversation_id: res.id,
    });
    if (!res2) throw new Error('failed to create conversation!');
    console.log(JSON.stringify(res2))
    console.log('participant 2 created!')
  } catch (err) {
    console.error(err);
  }
}

export default handleAddConversation;
