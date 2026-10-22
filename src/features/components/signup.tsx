'use client';
import { useState } from 'react';
import User from '../../types/User.ts';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"

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
      setError(res.error.toString())
      return;
    }

    const finRes = await signIn('credentials', {
      username: username.trim(),
      password: password.trim(),
      redirect: false
    })

    if (finRes?.error) {
      setError('Sign in failed, try again in the login screen!')
      return;
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center h-screen justify-center">
      <div className="flex flex-col gap-2 bg-gray-900 p-3">
        <div className="flex text-center">
          <span className="font-bold text-3xl">Sign Up</span>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            Email
            <input
              type="text"
              className="bg-black"
              onChange={(a) => setEmail(a.target.value)}
              name="email"
            />
          </label>
          <label className="flex flex-col gap-2 mt-2">
            Username
            <input
              type="text"
              className="bg-black"
              onChange={(a) => setUsername(a.target.value)}
              name="username"
            />
          </label>
          <label className="flex flex-col gap-2 mt-2">
            Name
            <input
              type="text"
              className="bg-black"
              onChange={(a) => setName(a.target.value)}
              name="name"
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
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
