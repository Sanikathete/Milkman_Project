export const ACCESS_TOKEN_KEY = 'milkman_access_token'
export const REFRESH_TOKEN_KEY = 'milkman_refresh_token'
export const USER_KEY = 'milkman_user'

export function readStoredJson(key, fallbackValue) {
  const raw = localStorage.getItem(key)
  if (!raw) {
    return fallbackValue
  }

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(key)
    return fallbackValue
  }
}

export function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
