import { connectDatabase, db } from "./db.ts";

const users = [
  { email: "admin@test.net", username: "admin", name: "Admin", active: true },
  { email: "bob@prisma.io", username: "bob", name: "Bob", active: true },
  { email: "carol@prisma.io", username: "carol", name: "Carol", active: true },
];

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
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}