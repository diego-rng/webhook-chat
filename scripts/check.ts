import { db } from '../src/prisma/db';
console.log(await db.orm.public.UserCredentials.all());
await db.close();