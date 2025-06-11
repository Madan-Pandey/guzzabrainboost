'use client'

import { useState } from 'react'
import { setCookie } from 'cookies-next'
import { useContext } from 'react'
import { playerContext } from '@/app/context/playerContext'
import { auth } from '@/auth'

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { AssignPlayerData } = useContext(playerContext)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      const state = Math.random().toString(36).substring(2, 15)
      setCookie('loginState', state, { maxAge: 600, path: '/' }) // Cookie expires in 10 minutes
      const loginUrl = new URL(`${process.env.NEXT_PUBLIC_GUHUZA_URL}/login`)
      loginUrl.searchParams.append('state', state)
      loginUrl.searchParams.append('redirect_uri', `${window.location.origin}/api/auth/callback/guhuza`)

      // Store the current URL to redirect back after login
      localStorage.setItem('loginRedirectUrl', window.location.pathname)

      window.location.href = loginUrl.toString()
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="quizPbtn"
    >
      {isLoading ? 'Redirecting...' : 'Login with Guhuza'}
    </button>
  )
}

