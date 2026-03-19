<template>
  <view class="app-page login-page" :class="themeClass">
    <view class="bg-shape"></view>
    
    <view class="intro-area">
      <view class="brand">水墨集市</view>
      <view class="slogan">校园闲置，一键流转</view>
    </view>

    <view class="login-form app-card">
      <view class="form-title">账号登录</view>
      
      <view class="input-group">
        <input v-model="form.username" placeholder="请输入用户名" class="clean-input" />
      </view>
      <view class="input-group">
        <input v-model="form.password" password placeholder="请输入密码" class="clean-input" />
      </view>

      <button class="login-btn-large" @click="handleLogin">登 录</button>
      
      <view class="form-footer">
        <text>注册账号</text>
        <text class="divider">|</text>
        <text>忘记密码</text>
      </view>
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
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60rpx;
  position: relative;
  overflow: hidden;
  height: 100vh;
  box-sizing: border-box;
}

.intro-area {
  margin-bottom: 60rpx;
  z-index: 2;
}

.brand {
  font-size: 60rpx;
  font-weight: 800;
  color: var(--ink-text);
  margin-bottom: 10rpx;
}

.slogan {
  font-size: 28rpx;
  color: var(--ink-subtext);
  letter-spacing: 4rpx;
}

.login-form {
  padding: 50rpx 40rpx;
  z-index: 2;
  border-radius: 30rpx;
}

.form-title {
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 40rpx;
  color: var(--ink-text);
}

.input-group {
  margin-bottom: 30rpx;
  border-bottom: 1rpx solid var(--ink-border);
  padding-bottom: 10rpx;
}

.clean-input {
  font-size: 30rpx;
  color: var(--ink-text);
  height: 60rpx;
}

.login-btn-large {
  margin-top: 50rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: var(--ink-text);
  color: var(--ink-bg);
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.login-btn-large:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.form-footer {
  margin-top: 30rpx;
  display: flex;
  justify-content: center;
  font-size: 24rpx;
  color: var(--ink-subtext);
}

.divider {
  margin: 0 20rpx;
  opacity: 0.3;
}
</style>
