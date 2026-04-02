import { useAuthStore } from '../store/auth'

const CAMPUS_OPTIONS = Object.freeze([
  { code: 'NEUSOFT', name: '广东东软学院' },
  { code: 'SCNU_NANHAI', name: '华南师范大学佛山校区南海校区' },
  { code: 'GD_LIGHT_INDUSTRY_NANHAI', name: '广东轻工职业技术大学南海校区' }
])

const CAMPUS_SOURCE_TEXT = Object.freeze({
  MANUAL: '手动选择',
  LOCATION: '定位绑定'
})

const ACTION_SHEET_SAFE_DELAY_MS = 180

export function getCampusOptions() {
  return CAMPUS_OPTIONS.slice()
}

export function resolveCampusName(campusCode = '') {
  const matched = CAMPUS_OPTIONS.find((item) => item.code === campusCode)
  return matched ? matched.name : ''
}

export function resolveCampusSourceLabel(bindSource = '') {
  return CAMPUS_SOURCE_TEXT[bindSource] || ''
}

export function hasBoundCampus(profile = {}) {
  return Boolean(profile && profile.campusCode)
}

export function getCampusDisplayName(profile = {}, fallback = '暂未绑定校区') {
  if (!profile || typeof profile !== 'object') {
    return fallback
  }
  return profile.campusName || resolveCampusName(profile.campusCode) || fallback
}

export function syncCampusProfile(profile = {}) {
  const authStore = useAuthStore().sync()
  const nextProfile = {
    ...(authStore.profile || {}),
    ...(profile || {})
  }
  authStore.setProfile(nextProfile)
  return nextProfile
}

export function chooseCampusOption() {
  return new Promise((resolve) => {
    // H5 下从一个 actionSheet 紧接着弹出另一个时，容易发生点击穿透。
    setTimeout(() => {
      uni.showActionSheet({
        itemList: CAMPUS_OPTIONS.map((item) => item.name),
        success: ({ tapIndex }) => resolve(CAMPUS_OPTIONS[tapIndex] || null),
        fail: () => resolve(null)
      })
    }, ACTION_SHEET_SAFE_DELAY_MS)
  })
}

function getLocationByType(type) {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type,
      success: ({ latitude, longitude }) => resolve({ latitude, longitude, coordType: type }),
      fail: reject
    })
  })
}

function buildLocationError(error) {
  const rawMessage = `${(error && (error.errMsg || error.message)) || ''}`.trim()
  const normalizedMessage = rawMessage.toLowerCase()

  if (
    normalizedMessage.includes('permission denied')
    || normalizedMessage.includes('auth deny')
    || normalizedMessage.includes('user denied')
    || normalizedMessage.includes('denied')
  ) {
    return new Error('浏览器定位权限已被拒绝，请在地址栏或站点设置中允许定位权限后重试')
  }

  if (
    normalizedMessage.includes('only secure origins are allowed')
    || normalizedMessage.includes('insecure')
    || normalizedMessage.includes('secure context')
  ) {
    return new Error('浏览器定位仅支持 https 或 localhost 环境，请切换到安全地址后重试')
  }

  return new Error(rawMessage || '获取定位失败，请检查浏览器定位权限和当前访问地址')
}

export function requestCampusLocation() {
  // #ifdef H5
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location
    const isSecureOrigin = protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1'
    if (!isSecureOrigin) {
      return Promise.reject(new Error('浏览器定位仅支持 https 或 localhost 环境，请切换地址后重试'))
    }
  }
  return getLocationByType('wgs84').catch((error) => Promise.reject(buildLocationError(error)))
  // #endif

  // #ifndef H5
  return getLocationByType('gcj02').catch(() => getLocationByType('wgs84')).catch((error) => Promise.reject(buildLocationError(error)))
  // #endif
}
