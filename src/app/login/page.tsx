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
    <div className="flex items-center h-screen justify-center bg-linear-to-br from-items via-items to-dark-purple">
      <div className="flex flex-col gap-2 bg-items rounded-4xl border border-gray-600 p-4">
        <div className="flex text-center">
          <span className="font-bold text-3xl">Log in</span>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            Username
            <input
              type="text"
              className="bg-light-gray px-2 rounded-full border border-gray-700"
              onChange={(a) => setUsername(a.target.value)}
              name="username"
            />
          </label>
          <label className="flex flex-col gap-2 mt-2">
            Password
            <input
              type="password"
              className="bg-light-gray px-2 rounded-full border border-gray-700"
              onChange={(a) => setPassword(a.target.value)}
              name="password"
            />
          </label>

          {error && <p className="text-red-600 mt-2">{error}</p>}

          <button
            type="submit"
            className="mt-3 bg-dark-purple hover:bg-dark-purple/65 border border-gray-700 px-2 py-1 cursor-pointer rounded-full"
          >
            Sign in
          </button>
        </form>
        <a
          className="text-blue-500 ml-2 text-xs cursor-pointer hover:underline"
          onClick={() => router.push('/login/signup')}
        >
          Sign up
        </a>
      </div>
    </div>
  );
}
