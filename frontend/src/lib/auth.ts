import { jwtDecode } from 'jwt-decode'
import {
  getServerSession,
  type NextAuthOptions,
  type Session,
  type User
} from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getSession } from 'next-auth/react'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import fetcher from './fetcher'
import type { ParsedJWT } from './types/jwt'
import { API_BASE_URL } from './vars'

export const getParsedJWTToken = (res: Response): ParsedJWT => {
  const accessToken = res.headers.get('authorization')
  const cookies = res.headers.get('set-cookie')

  if (accessToken == null) {
    throw new Error('Response does not contain an access token')
  }

  if (cookies == null) {
    throw new Error('Response does not contain a cookie')
  }

  const decoded = jwtDecode(accessToken)

  if (decoded.exp == null) {
    throw new Error('Response does not contain an expiration')
  }

  const accessTokenExpires = decoded.exp * 1000

  const parsedCookie = parseCookie(cookies)
  const refreshToken = parsedCookie.get('refresh_token')
  const refreshTokenExpires = parsedCookie.get('Expires')

  if (refreshToken == null || refreshTokenExpires == null) {
    throw new Error(
      'Response does not contain a valid refresh token or expiration date'
    )
  }

  return {
    accessToken,
    refreshToken,
    accessTokenExpires,
    refreshTokenExpires: Date.parse(refreshTokenExpires)
  }
}

const authorize = async <C extends Record<string, string>>(
  credential?: C
): Promise<User | null> => {
  try {
    const loginResponse = await fetcher.post<Response>('auth/login', {
      json: {
        username: credential?.username,
        password: credential?.password
      }
    })

    const {
      accessToken,
      refreshToken,
      refreshTokenExpires,
      accessTokenExpires
    } = getParsedJWTToken(loginResponse)

    const userResponse = await fetch(API_BASE_URL + '/user', {
      method: 'GET',
      headers: {
        Authorization: accessToken
      },
      cache: 'no-store'
    })

    const user: User = await userResponse.json()

    return {
      username: user.username,
      role: user.role,
      accessToken,
      refreshToken,
      accessTokenExpires,
      refreshTokenExpires
    } as User
  } catch (error) {
    console.log(error)
    return null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'username', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      authorize
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 24 hours
  },
  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      if (user) {
        token.username = user.username
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpires = user.accessTokenExpires
        token.refreshTokenExpires = user.refreshTokenExpires
      }

      return token
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      session.user = {
        username: token.username,
        role: token.role,
        status: token.status
      }

      session.token = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        accessTokenExpires: token.accessTokenExpires,
        refreshTokenExpires: token.refreshTokenExpires
      }

      return session
    }
  }
}

/**
 * Get session data.
 * @description If call this function in client, then call getSession, else call getServerSession.
 */
export const auth = async (): Promise<Session | null> =>
  typeof window !== 'undefined'
    ? await getSession()
    : await getServerSession(authOptions)
