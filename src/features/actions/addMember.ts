'use server';
import { db } from '../../prisma/db.ts';
import { UserOption } from '../components/ParticipantPicker.tsx';

export default async function handleAddMember(
  conversationId: string & { readonly __charLength: 36 },
  users: readonly UserOption[],
) {
  const userIds = users.map((a) => a.value);
  await db.orm.public.ConversationParticipant.createAll(
    userIds.map((a) => ({ conversation_id: conversationId, user_id: a })),
  );
}
