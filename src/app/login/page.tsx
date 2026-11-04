'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const res = await signIn('credentials', {
      username: username.trim(),
      password: password.trim(),
      redirect: false,
    });

    if (res?.error) {
      setError('Invalid username or password!');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex items-center h-screen justify-center">
      <div className="flex flex-col gap-2 bg-gray-900 p-3">
        <div className="flex text-center">
          <span className="font-bold text-3xl">Log in</span>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            Username
            <input
              type="text"
              className="bg-black"
              onChange={(a) => setUsername(a.target.value)}
              name="username"
            />
          </label>
          <label className="flex flex-col gap-2 mt-2">
            Password
            <input
              type="password"
              className="bg-black"
              onChange={(a) => setPassword(a.target.value)}
              name="password"
            />
          </label>

          {error && <p className="text-red-600 mt-2">{error}</p>}

          <button
            type="submit"
            className="mt-2 bg-gray-600 px-2 py-1 rounded-full"
          >
            Sign in
          </button>
        </form>
        <a
          className="text-blue-600 ml-2 text-sm cursor-pointer hover:underline"
          onClick={() => router.push('/login/signup')}
        >
          Sign up
        </a>
      </div>
    </div>
  );
}
