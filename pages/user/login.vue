<template>
  <view class="app-page" :class="themeClass">
    <view class="login-head app-card">
      <view class="login-title">账号登录</view>
      <view class="login-sub">登录后可进行发布、下单和订单管理</view>
    </view>

    <view class="login-card app-card">
      <input v-model="form.username" placeholder="请输入用户名" class="app-input" />
      <input v-model="form.password" password placeholder="请输入密码" class="app-input" />
      <button class="app-primary-btn" @click="handleLogin">登录</button>
    </view>
  </view>
</template>

<script>
import { login } from '../../api/auth'
import { getTheme, resolveThemeClass, applyNavigationTheme } from '../../utils/theme'

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      themeClass: resolveThemeClass(getTheme())
    }
  },
  onShow() {
    this.syncTheme()
  },
  methods: {
    syncTheme() {
      const theme = getTheme()
      this.themeClass = resolveThemeClass(theme)
      applyNavigationTheme(theme)
    },
    handleLogin() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请输入账号密码', icon: 'none' })
        return
      }
      login(this.form).then((res) => {
        if (res && res.code === 0 && res.data && res.data.token) {
          uni.setStorageSync('token', res.data.token)
          uni.showToast({ title: '登录成功' })
          uni.reLaunch({ url: '/pages/index/index' })
          return
        }
        uni.showToast({ title: (res && res.message) || '登录失败', icon: 'none' })
      }).catch(() => {
        uni.showToast({ title: '登录失败', icon: 'none' })
      })
    }
  }
}
</script>

<style scoped>
.login-head {
  padding: 20rpx;
  margin-bottom: 14rpx;
}

.login-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink-text);
}

.login-sub {
  margin-top: 8rpx;
  color: var(--ink-subtext);
  font-size: 23rpx;
}

.login-card {
  padding: 20rpx;
}

.app-input {
  margin-bottom: 14rpx;
}
</style>
