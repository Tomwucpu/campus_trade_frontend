const AUTH_KEY = 'token'

export const useAuthStore = () => {
  const token = uni.getStorageSync(AUTH_KEY) || ''

  function setToken(value) {
    uni.setStorageSync(AUTH_KEY, value)
  }

  function clearToken() {
    uni.removeStorageSync(AUTH_KEY)
  }

  return {
    token,
    setToken,
    clearToken
  }
}
