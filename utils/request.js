import { useAuthStore } from '../store/auth'

export const BASE_URL = 'http://localhost:8080/api/v1'

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
          authStore.logout()
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          uni.reLaunch({ url: '/pages/user/login' })
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
