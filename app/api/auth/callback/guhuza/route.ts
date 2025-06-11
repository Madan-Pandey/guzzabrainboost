import { NextRequest, NextResponse } from 'next/server'
import { getCookie, deleteCookie } from 'cookies-next'
import prisma from '@/lib/prisma'

import { signIn } from '@/auth'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const token = searchParams.get('token')
  const state = searchParams.get('state')

  // Verify the state to prevent CSRF attacks
  const storedState = await getCookie('loginState', { req })
  if (state !== storedState) {
    return NextResponse.redirect(new URL('/?error=invalid_state', req.url))
  }
  deleteCookie('loginState', { req })

  if (userId && token) {
    try {
      const signInResult = await signIn('credentials', {
        userId,
        token,
        redirect: false,
      })

      if (signInResult?.error) {
        return NextResponse.redirect(new URL(`/?error=${signInResult.error}`, req.url))
      }

      // Get the stored redirect URL or default to home
      const redirectPath = process.env.REDIRECT_PATH || '/'

      // Create response with redirect
      const response = NextResponse.redirect(new URL(redirectPath, req.url))

      // Set a flag to indicate successful login
      response.cookies.set('justLoggedIn', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30, // 30 seconds
        path: '/'
      })

      return response
    } catch (error) {
      console.error('Error during sign in:', error)
      return NextResponse.redirect(new URL('/?error=signin_failed', req.url))
    }
  }

  return NextResponse.redirect(new URL('/?error=missing_params', req.url))
}

