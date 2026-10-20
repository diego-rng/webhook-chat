import bcrypt from "bcryptjs";
import { connectDatabase, db } from "./db.ts";

const users = [
  { user_id: '1', email: "admin@test.net", username: "admin", name: "Admin", active: true },
  { email: "bob@prisma.io", username: "bob", name: "Bob", active: true },
  { email: "carol@prisma.io", username: "carol", name: "Carol", active: true },
];

const userCredentials = [
  {username: 'admin', user_id: '1', password: bcrypt.hashSync('password')}
]

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();

  for (const user of users) {
    await db.orm.public.User.upsert({
      create: user,
      update: {},
      conflictOn: { email: user.email },
    });
  }

  for (const cred of userCredentials) {
    await db.orm.public.UserCredentials.upsert({
      create: cred,
      update: {}
    })
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}