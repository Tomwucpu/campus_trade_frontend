<template>
  <view class="market-page login-page theme-light">
    <view class="login-hero safe-top">
      <view class="hero-orb orb-right"></view>
      <view class="hero-orb orb-left"></view>
      <view class="login-brand-icon">
        <text class="icon-font bi bi-shop login-brand-glyph"></text>
      </view>
      <view class="login-brand-title">校园二手市集</view>
      <view class="login-brand-subtitle">让闲置流转起来，继续在校内遇见合适的物品。</view>
    </view>

    <view class="market-shell login-shell">
      <view class="market-card login-card">
        <view class="auth-tabs">
          <view class="auth-tab active">登录</view>
          <view class="auth-tab" @click="goRegister">注册</view>
        </view>

        <view class="field-group">
          <view class="field-label">账号</view>
          <input
            v-model="form.username"
            class="market-input"
            placeholder="请输入用户名"
          />
        </view>

        <view class="field-group">
          <view class="field-label">密码</view>
          <input
            v-model="form.password"
            class="market-input"
            password
            placeholder="请输入密码"
          />
        </view>

        <view class="login-extra">
          <text>登录后可用更多功能</text>
          <text class="login-link">忘记密码？</text>
        </view>

        <button class="market-primary-btn submit-btn" @click="handleLogin">登录</button>

        <view class="bottom-tip">
          <text class="tip-text">还没有账号？</text>
          <text class="tip-link" @click="goRegister">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { syncThemePage } from '../../utils/theme'

export default {
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      form: {
        username: '',
        password: ''
      }
    }
  },
  onLoad(options) {
    syncThemePage(this)
    if (options && options.username) {
      this.form.username = decodeURIComponent(options.username)
    }
  },
  onShow() {
    syncThemePage(this)
  },
  methods: {
    goRegister() {
      uni.navigateTo({ url: '/pages/user/register' })
    },
    handleLogin() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请输入账号和密码', icon: 'none' })
        return
      }

      login(this.form)
        .then((res) => {
          if (res && res.code === 0 && res.data && res.data.token) {
            this.authStore.setSession({
              token: res.data.token,
              profile: {
                id: res.data.userId,
                username: res.data.username || this.form.username
              }
            })
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' })
            }, 260)
            return
          }

          uni.showToast({ title: (res && res.message) || '登录失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '登录失败', icon: 'none' })
        })
    }
  }
}
</script>

<style scoped>
.login-page {
  background: #fffef9;
}

.login-hero {
  position: relative;
  padding: 0 32rpx 160rpx;
  background: linear-gradient(135deg, #2d6a4f 0%, #1b5e20 100%);
  text-align: center;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  filter: blur(6rpx);
}

.orb-right {
  width: 260rpx;
  height: 260rpx;
  top: 60rpx;
  right: -50rpx;
}

.orb-left {
  width: 320rpx;
  height: 320rpx;
  left: -80rpx;
  bottom: -100rpx;
}

.login-brand-icon {
  width: 112rpx;
  height: 112rpx;
  margin: 40rpx auto 24rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 52rpx;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.login-brand-glyph {
  font-size: 52rpx;
  line-height: 1;
}

.login-brand-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12rpx;
  position: relative;
  z-index: 1;
}

.login-brand-subtitle {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
  position: relative;
  z-index: 1;
}

.login-shell {
  margin-top: -96rpx;
  position: relative;
  z-index: 2;
}

.login-card {
  padding: 28rpx;
}

.auth-tabs {
  display: flex;
  gap: 8rpx;
  padding: 8rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
  margin-bottom: 28rpx;
}

.auth-tab {
  flex: 1;
  min-height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 26rpx;
  font-weight: 600;
}

.auth-tab.active {
  background: #ffffff;
  color: #2d6a4f;
  box-shadow: 0 8rpx 18rpx rgba(45, 106, 79, 0.08);
}

.field-group {
  margin-bottom: 22rpx;
}

.field-label {
  font-size: 24rpx;
  color: #2c3e50;
  margin-bottom: 14rpx;
}

.login-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  font-size: 22rpx;
  color: #6c757d;
  margin-bottom: 28rpx;
}

.login-link {
  color: #2d6a4f;
}

.submit-btn {
  width: 100%;
}

.bottom-tip {
  margin-top: 24rpx;
  text-align: center;
  font-size: 24rpx;
}

.tip-text {
  color: #6c757d;
}

.tip-link {
  color: #2d6a4f;
  font-weight: 600;
  margin-left: 8rpx;
}
</style>
