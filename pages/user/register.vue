<template>
  <view class="market-page register-page theme-light">
    <view class="login-hero safe-top">
      <view class="hero-orb orb-right"></view>
      <view class="hero-orb orb-left"></view>
      <view class="login-brand-icon">新</view>
      <view class="login-brand-title">创建校园账号</view>
      <view class="login-brand-subtitle">注册后可发布闲置、收藏商品并跟踪整个交易流程。</view>
    </view>

    <view class="market-shell login-shell">
      <view class="market-card login-card">
        <view class="auth-tabs">
          <view class="auth-tab" @click="goLogin">登录</view>
          <view class="auth-tab active">注册</view>
        </view>

        <view class="field-group">
          <view class="field-label">用户名</view>
          <input v-model="form.username" class="market-input" placeholder="请设置用户名" />
        </view>

        <view class="field-group">
          <view class="field-label">密码</view>
          <input v-model="form.password" class="market-input" password placeholder="请设置密码" />
        </view>

        <view class="field-group">
          <view class="field-label">确认密码</view>
          <input v-model="form.confirmPassword" class="market-input" password placeholder="请再次输入密码" />
        </view>

        <view class="register-notes">
          <view class="market-tag muted">同校交易</view>
          <view class="market-tag muted">发布闲置</view>
          <view class="market-tag muted">订单跟踪</view>
        </view>

        <button class="market-primary-btn submit-btn" @click="handleRegister">注册账号</button>

        <view class="agreement-tip">注册即表示你同意平台使用规则与校园交易约定。</view>

        <view class="bottom-tip">
          <text class="tip-text">已有账号？</text>
          <text class="tip-link" @click="goLogin">去登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { register } from '../../api/auth'
import { syncThemePage } from '../../utils/theme'

export default {
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      form: {
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  onLoad() {
    syncThemePage(this)
  },
  onShow() {
    syncThemePage(this)
  },
  methods: {
    goLogin() {
      uni.navigateBack({
        fail: () => {
          uni.navigateTo({ url: '/pages/user/login' })
        }
      })
    },
    handleRegister() {
      const { username, password, confirmPassword } = this.form

      if (!username || !password || !confirmPassword) {
        uni.showToast({ title: '请完整填写注册信息', icon: 'none' })
        return
      }

      if (password !== confirmPassword) {
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
        return
      }

      register({ username, password })
        .then((res) => {
          if (res && res.code === 0) {
            uni.showToast({ title: res.message || '注册成功', icon: 'success' })
            setTimeout(() => {
              uni.redirectTo({
                url: `/pages/user/login?username=${encodeURIComponent(username)}`
              })
            }, 260)
            return
          }

          uni.showToast({ title: (res && res.message) || '注册失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '注册失败', icon: 'none' })
        })
    }
  }
}
</script>

<style scoped>
.register-page {
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

.register-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 10rpx 0 24rpx;
}

.submit-btn {
  width: 100%;
}

.agreement-tip {
  margin-top: 20rpx;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.7;
  color: #6c757d;
}

.bottom-tip {
  margin-top: 22rpx;
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
