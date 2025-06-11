/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { SessionProvider as AuthSessionProvider } from "next-auth/react"


export default function SessionProvider({ children, session }: any) {
  return (
    <AuthSessionProvider session={session}>
      {children}
    </AuthSessionProvider>
  )
}

