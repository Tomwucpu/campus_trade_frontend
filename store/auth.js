const TOKEN_KEY = 'token'
const PROFILE_KEY = 'user_profile'

function readProfile() {
  const profile = uni.getStorageSync(PROFILE_KEY)
  return profile && typeof profile === 'object' ? profile : {}
}

const authStore = {
  token: uni.getStorageSync(TOKEN_KEY) || '',
  profile: readProfile(),

  sync() {
    this.token = uni.getStorageSync(TOKEN_KEY) || ''
    this.profile = readProfile()
    return this
  },

  setToken(value) {
    this.token = value || ''
    if (this.token) {
      uni.setStorageSync(TOKEN_KEY, this.token)
      return
    }
    uni.removeStorageSync(TOKEN_KEY)
  },

  setProfile(profile) {
    this.profile = profile && typeof profile === 'object' ? profile : {}
    if (Object.keys(this.profile).length) {
      uni.setStorageSync(PROFILE_KEY, this.profile)
      return
    }
    uni.removeStorageSync(PROFILE_KEY)
  },

  setSession({ token, profile } = {}) {
    if (typeof token !== 'undefined') {
      this.setToken(token)
    }
    if (typeof profile !== 'undefined') {
      this.setProfile(profile)
    }
  },

  clearToken() {
    this.setToken('')
  },

  clearProfile() {
    this.setProfile({})
  },

  logout() {
    this.clearToken()
    this.clearProfile()
  },

  isLoggedIn() {
    return Boolean(this.token)
  },

  getDisplayName() {
    return this.profile.username || '墨友'
  }
}

export const useAuthStore = () => authStore
