import 'next-auth';
import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      username: string;
      user_id: string;
    } & DefaultSession['user'];
  }

  interface User {
    username: string;
    user_id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string;
    user_id: string;
  }
}