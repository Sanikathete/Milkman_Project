export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data

  if (!data) {
    return fallback
  }

  if (typeof data === 'string') {
    return data
  }

  if (data.detail && typeof data.detail === 'string') {
    return data.detail
  }

  const firstKey = Object.keys(data)[0]
  const value = data[firstKey]

  if (Array.isArray(value) && value.length > 0) {
    return String(value[0])
  }

  if (typeof value === 'string') {
    return value
  }

  return fallback
}
