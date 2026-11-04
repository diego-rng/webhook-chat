import bcrypt from "bcryptjs";
import { connectDatabase, db } from "./db.ts";
import { Char } from "@prisma/orm-postgres/target/codec-types";

const ADMIN_ID = "00000000-0000-4000-8000-000000000001" as Char<36>;

const users = [
  { id: ADMIN_ID, email: "admin@test.net", username: "admin", name: "Admin", active: true },
  { email: "bob@prisma.io", username: "bob", name: "Bob", active: true },
  { email: "carol@prisma.io", username: "carol", name: "Carol", active: true },
];

const userCredentials = [
  { username: "admin", user_id: ADMIN_ID, password: bcrypt.hashSync("password", 10) },
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

  for (const cred of userCredentials) {
    await db.orm.public.UserCredentials.upsert({
      create: cred,
      update: {},
      conflictOn: { username: cred.username },
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

if (import.meta.main) {
  await seed();
  await db.close();
}