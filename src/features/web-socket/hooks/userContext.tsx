'use client'

import React, { createContext, useContext, useState } from 'react';
import type User from '../types/User.ts'

const mockUser: User = {
  userId: crypto.randomUUID(),
  username: 'admin',
  name: 'admin',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  email: 'admin@test.net'
}

export const UserContext = createContext(mockUser)

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [User] = useState<User>(useContext(UserContext))

  return (
    <UserContext.Provider value={User}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}