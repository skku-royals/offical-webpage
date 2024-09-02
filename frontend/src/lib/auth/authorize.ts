import type { User } from 'next-auth'
import { API_BASE_URL } from '../vars'
import { getParsedJWTToken } from './token'

export const authorize = async <C extends Record<string, string>>(
  credential?: C
): Promise<User | null> => {
  try {
    const loginResponse = await fetch(API_BASE_URL + '/auth/login', {
      method: 'POST',
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      body: JSON.stringify(credential)
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
