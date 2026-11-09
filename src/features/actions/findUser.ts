'use server'
import { db } from '../../prisma/db.ts';
import { UserOption } from "../components/ParticipantPicker.tsx";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, '\\$&');

export async function findUser(input: string): Promise<UserOption[]> {
  const q = input.trim();
  if (!q) return [];

  const users = await db.orm.public.User.where((a) =>
    a.username.ilike(`%${escapeLike(q)}%`),
  )
    .select('id', 'username')
    .orderBy((u) => u.username.asc())
    .limit(10)
    .all();
  
  return users.map((u) => ({ value: u.id, label: u.username }))
}
