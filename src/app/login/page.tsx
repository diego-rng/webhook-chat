'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()
  return (
    <div>
      <div className='flex items-center h-screen justify-center'>
        <div className='flex flex-col gap-2'>
          <div className='flex text-center'>
            <span className="font-bold text-3xl">Log in</span>
          </div>
          <form>
            <label className="flex flex-col gap-2">
              Username
              <input type='text' onChange={(a) => setUsername(a.target.value)} name='username' />
            </label>
            <label className="flex flex-col gap-2">
              Password
              <input type='password' onChange={(a) => setPassword(a.target.value)} name='password' />
            </label>

            <button type='submit' onClick={() => signIn('credentials', { username: username, password: password })} className="mt-2">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  );
}
