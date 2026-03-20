import { useAuthStore } from '../store/auth'

export const BASE_URL = 'http://localhost:8080/api/v1'

function handleUnauthorized(authStore) {
  authStore.logout()
  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
  uni.reLaunch({ url: '/pages/user/login' })
}

export function request(options) {
  const authStore = useAuthStore().sync()

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
        ...(options.header || {})
      },
      success: (res) => {
        if (res.statusCode === 401) {
          handleUnauthorized(authStore)
          reject(res)
          return
        }
        resolve(res.data)
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

export function uploadFile(options) {
  const authStore = useAuthStore().sync()

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + options.url,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: {
        ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
        ...(options.header || {})
      },
      success: (res) => {
        if (res.statusCode === 401) {
          handleUnauthorized(authStore)
          reject(res)
          return
        }

        try {
          resolve(typeof res.data === 'string' ? JSON.parse(res.data) : res.data)
        } catch (error) {
          reject(error)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}
