<template>
  <view class="app-page register-page" :class="themeClass">
    <view class="register-copy">
      <view class="register-kicker">Ink Enrollment</view>
      <view class="register-brand">开一枚新章</view>
      <view class="register-text">
        创建一个新的集市账号，注册成功后会返回登录页，并自动带上你刚填写的用户名。
      </view>
    </view>

    <view class="register-card app-card">
      <view class="register-card-title">账号注册</view>

      <view class="input-block">
        <view class="input-label">用户名</view>
        <input
          v-model="form.username"
          class="app-input"
          placeholder="请输入用户名"
        />
      </view>

      <view class="input-block">
        <view class="input-label">密码</view>
        <input
          v-model="form.password"
          class="app-input"
          password
          placeholder="请设置密码"
        />
      </view>

      <view class="input-block">
        <view class="input-label">确认密码</view>
        <input
          v-model="form.confirmPassword"
          class="app-input"
          password
          placeholder="请再次输入密码"
        />
      </view>

      <view class="register-notes">
        <view class="note-chip">同校交易</view>
        <view class="note-chip">黑白主题同步</view>
        <view class="note-chip">本地草稿可继续使用</view>
      </view>

      <button class="app-primary-btn register-btn" @click="handleRegister">完成注册</button>

      <view class="register-footer">
        <text class="footer-text">已经有账号了？</text>
        <text class="footer-link" @click="goLogin">返回登录</text>
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
      themeClass: '',
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
            }, 350)
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48rpx;
}

.register-copy {
  margin-bottom: 40rpx;
  position: relative;
  z-index: 1;
}

.register-kicker {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  text-transform: uppercase;
  color: var(--ink-subtext);
  margin-bottom: 10rpx;
}

.register-brand {
  font-family: var(--ink-font-title);
  font-size: 62rpx;
  color: var(--ink-text);
  margin-bottom: 18rpx;
}

.register-text {
  max-width: 560rpx;
  font-size: 25rpx;
  line-height: 1.9;
  color: var(--ink-subtext);
}

.register-card {
  padding: 36rpx 34rpx;
}

.register-card-title {
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

.register-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin: 6rpx 0 22rpx;
}

.note-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  font-size: 20rpx;
}

.register-btn {
  width: 100%;
}

.register-footer {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.footer-text {
  color: var(--ink-subtext);
  font-size: 22rpx;
}

.footer-link {
  color: var(--ink-text);
  font-size: 22rpx;
  font-weight: 600;
}
</style>
