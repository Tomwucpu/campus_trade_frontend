<template>
  <view class="app-page login-page" :class="themeClass">
    <view class="login-copy">
      <view class="login-kicker">Ink Access</view>
      <view class="login-brand">水墨集市</view>
      <view class="login-text">
        登录后可浏览商品、查看订单，并继续编辑你的发布内容。
      </view>
    </view>

    <view class="login-card app-card">
      <view class="login-card-title">账号登录</view>

      <view class="input-block">
        <view class="input-label">用户名</view>
        <input
          v-model="form.username"
          class="app-input"
          placeholder="输入用户名"
        />
      </view>

      <view class="input-block">
        <view class="input-label">密码</view>
        <input
          v-model="form.password"
          class="app-input"
          password
          placeholder="输入密码"
        />
      </view>

      <button class="app-primary-btn login-btn" @click="handleLogin">进入集市</button>

      <view class="login-footer">
        <text class="login-link" @click="goRegister">注册账号</text>
        <text class="login-divider">·</text>
        <text>成功后自动回到首页</text>
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
      themeClass: '',
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
                username: res.data.username || this.form.username
              }
            })
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' })
            }, 300)
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48rpx;
}

.login-copy {
  margin-bottom: 42rpx;
  position: relative;
  z-index: 1;
}

.login-kicker {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  text-transform: uppercase;
  color: var(--ink-subtext);
  margin-bottom: 10rpx;
}

.login-brand {
  font-family: var(--ink-font-title);
  font-size: 66rpx;
  color: var(--ink-text);
  margin-bottom: 18rpx;
}

.login-text {
  max-width: 560rpx;
  font-size: 25rpx;
  line-height: 1.9;
  color: var(--ink-subtext);
}

.login-card {
  padding: 36rpx 34rpx;
}

.login-card-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 28rpx;
}

.input-block {
  margin-bottom: 24rpx;
}

.input-label {
  font-size: 23rpx;
  color: var(--ink-subtext);
  margin-bottom: 12rpx;
}

.login-btn {
  width: 100%;
  margin-top: 12rpx;
}

.login-footer {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-subtext);
  font-size: 22rpx;
}

.login-link {
  color: var(--ink-text);
  font-weight: 600;
}

.login-divider {
  margin: 0 10rpx;
  opacity: 0.5;
}
</style>
