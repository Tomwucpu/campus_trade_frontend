<template>
  <view class="app-page" :class="themeClass">
    <view class="profile-head app-card">
      <view class="profile-title">个人中心</view>
      <view class="profile-sub">管理账号状态与主题偏好</view>
    </view>

    <view class="profile-card app-card">
      <view class="profile-row">
        <view class="profile-label">当前状态</view>
        <view class="profile-value">已登录</view>
      </view>

      <view class="profile-row theme-row">
        <view class="profile-label">主题模式</view>
        <view class="theme-switch">
          <view class="theme-btn" :class="{ active: theme === 'light' }" @click="changeTheme('light')">白色</view>
          <view class="theme-btn" :class="{ active: theme === 'dark' }" @click="changeTheme('dark')">黑色</view>
        </view>
      </view>

      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
import { getTheme, setTheme, resolveThemeClass, applyNavigationTheme } from '../../utils/theme'

export default {
  data() {
    return {
      theme: getTheme(),
      themeClass: resolveThemeClass(getTheme())
    }
  },
  onShow() {
    this.syncTheme()
  },
  methods: {
    syncTheme() {
      this.theme = getTheme()
      this.themeClass = resolveThemeClass(this.theme)
      applyNavigationTheme(this.theme)
    },
    changeTheme(next) {
      this.theme = setTheme(next)
      this.themeClass = resolveThemeClass(this.theme)
      uni.showToast({ title: this.theme === 'dark' ? '已切换黑色主题' : '已切换白色主题', icon: 'none' })
    },
    logout() {
      uni.removeStorageSync('token')
      uni.showToast({ title: '已退出' })
      uni.reLaunch({ url: '/pages/user/login' })
    }
  }
}
</script>

<style scoped>
.profile-head {
  padding: 20rpx;
  margin-bottom: 14rpx;
}

.profile-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink-text);
}

.profile-sub {
  margin-top: 8rpx;
  color: var(--ink-subtext);
  font-size: 23rpx;
}

.profile-card {
  padding: 20rpx;
}

.profile-row {
  min-height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.theme-row {
  margin-top: 4rpx;
  margin-bottom: 18rpx;
}

.profile-label {
  color: var(--ink-subtext);
  font-size: 24rpx;
}

.profile-value {
  color: var(--ink-text);
  font-size: 27rpx;
  font-weight: 700;
}

.theme-switch {
  display: flex;
  gap: 10rpx;
}

.theme-btn {
  min-width: 86rpx;
  height: 52rpx;
  padding: 0 14rpx;
  border-radius: 26rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

.theme-btn.active {
  background: var(--ink-tag-active-bg);
  color: var(--ink-tag-active-text);
}

.logout-btn {
  border-radius: 16rpx;
  border: 1rpx solid var(--ink-border);
  font-size: 30rpx;
  font-weight: 600;
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
}

.logout-btn:active {
  opacity: 0.9;
}
</style>
