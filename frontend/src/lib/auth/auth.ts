import { getServerSession, type Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { authOptions } from './authOptions'

export const getClientSession = () => {
  let session: Session | null = null

  return async () => {
    if (!session || session.token.accessTokenExpires < Date.now()) {
      session = await getSession()
    }

    return session
  }
}

/**
 * Get session data.
 * @description If call this function in client, then call getSession, else call getServerSession.
 */
export const auth =
  typeof window === 'undefined'
    ? async () => getServerSession(authOptions)
    : getClientSession()
