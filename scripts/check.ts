import { db } from '../src/prisma/db.ts';
console.log(await db.orm.public.UserCredentials.all());
await db.close();