'use client'

import React, { createContext, useContext, useState } from 'react';

export const UserContext = createContext({
  userId: crypto.randomUUID
})

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [User] = useState<object>(useContext(UserContext))

  return (
    <UserContext.Provider value={User}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}