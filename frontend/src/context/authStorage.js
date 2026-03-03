export const ACCESS_TOKEN_KEY = 'milkman_access_token'
export const REFRESH_TOKEN_KEY = 'milkman_refresh_token'
export const USER_KEY = 'milkman_user'

export function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
