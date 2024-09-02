import { encode, getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'
import { getParsedJWTToken } from './lib/auth/token'
import { API_BASE_URL } from './lib/vars'

const sessionCookieName = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token'

export const middleware = async (req: NextRequest) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (req.nextUrl.pathname.startsWith('/console') && !token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (token && token.accessTokenExpires <= Date.now()) {
    try {
      const reissueRes = await fetch(API_BASE_URL + '/auth/reissue', {
        headers: {
          cookie: `refresh_token=${token.refreshToken}`
        },
        cache: 'no-store'
      })

      if (!reissueRes.ok) {
        throw new Error('Failed to reissue token')
      }

      const {
        accessToken,
        refreshToken,
        accessTokenExpires,
        refreshTokenExpires
      } = getParsedJWTToken(reissueRes)

      const newToken = await encode({
        secret: process.env.NEXTAUTH_SECRET as string,
        token: {
          ...token,
          accessToken,
          refreshToken,
          accessTokenExpires,
          refreshTokenExpires
        },
        maxAge: 7 * 24 * 60 * 60
      })

      req.cookies.set(sessionCookieName, newToken)

      const reissuedResponse = NextResponse.next({
        request: {
          headers: new Headers(req.headers)
        }
      })

      reissuedResponse.cookies.set(sessionCookieName, newToken, {
        maxAge: 7 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
      })

      return reissuedResponse
    } catch {
      req.cookies.delete(sessionCookieName)

      const deletedResponse = NextResponse.next({
        request: {
          headers: new Headers(req.headers)
        }
      })
      deletedResponse.cookies.delete(sessionCookieName)

      return deletedResponse
    }
  }
}
