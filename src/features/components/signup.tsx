'use client';
import { useState } from 'react';
import User from '../../types/User.ts';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface SignUpFunction {
  username: string;
  name?: string;
  email: string;
  password: string;
}

export interface SignUpRes {
  user?: User;
  error?: string | unknown;
}

interface SignUpProps {
  handleSignUp: (props: SignUpFunction) => Promise<SignUpRes>;
}

export default function SignUpPage({ handleSignUp }: SignUpProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!username || !password || !email) {
      setError('Missing necessary field!');
      return;
    }

    const obj = {
      username: username,
      password: password,
      email: email,
      name: name,
    };

    const res = await handleSignUp(obj);

    if (res.error) {
      setError(res.error.toString());
      return;
    }

    const finRes = await signIn('credentials', {
      username: username.trim(),
      password: password.trim(),
      redirect: false,
    });

    if (finRes?.error) {
      setError('Sign in failed, try again in the login screen!');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex items-center h-screen justify-center bg-linear-to-br from-items via-items to-dark-purple">
      <div className="flex flex-col gap-2 bg-items rounded-4xl border border-gray-600 p-4">
        <div className="flex text-center">
          <span className="font-bold text-3xl">Sign Up</span>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            Email
            <input
              type="text"
              className="bg-light-gray px-2 rounded-full border border-gray-700"
              onChange={(a) => setEmail(a.target.value)}
              name="email"
            />
          </label>
          <label className="flex flex-col gap-2 mt-2">
            Username
            <input
              type="text"
              className="bg-light-gray px-2 rounded-full border border-gray-700"
              onChange={(a) => setUsername(a.target.value)}
              name="username"
            />
          </label>
          <label className="flex flex-col gap-2 mt-2">
            <span>
              Name{' '}
              <span className="inline text-xs text-gray-500">(optional)</span>
            </span>
            <input
              type="text"
              className="bg-light-gray px-2 rounded-full border border-gray-700"
              onChange={(a) => setName(a.target.value)}
              name="name"
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

          <div className='flex flex-row justify-center place-items-center gap-2 mt-3'>
            <button
              type="submit"
              className="bg-dark-purple hover:bg-dark-purple/65 border border-gray-700 px-2 py-1 cursor-pointer rounded-full"
            >
              Sign up
            </button>
            <a href="/login" className="text-blue-500 ml-2 text-xs cursor-pointer hover:underline">
              Return to login page
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
