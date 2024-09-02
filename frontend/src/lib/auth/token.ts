import { jwtDecode } from 'jwt-decode'
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import type { ParsedJWT } from '../types/jwt'

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
