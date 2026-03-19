<template>
  <view class="app-page" :class="themeClass">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="avatar-area">
        <view class="avatar-circle"></view>
        <view class="user-info">
          <view class="nickname">用户_水墨客</view>
          <view class="user-tag">信用极好</view>
        </view>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">12</text>
          <text class="stat-label">我发布的</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">5</text>
          <text class="stat-label">我卖出的</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">2</text>
          <text class="stat-label">我买到的</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">8</text>
          <text class="stat-label">收藏</text>
        </view>
      </view>
    </view>

    <!-- 设置组 -->
    <view class="menu-group app-card">
      <view class="menu-item">
        <text class="menu-label">当前状态</text>
        <text class="menu-val">已登录</text>
      </view>
      <view class="menu-item">
        <text class="menu-label">主题模式</text>
        <view class="theme-switch-mini">
           <view 
            class="switch-opt" 
            :class="{ active: theme === 'light' }" 
            @click="changeTheme('light')"
           >白</view>
           <view 
            class="switch-opt" 
            :class="{ active: theme === 'dark' }" 
            @click="changeTheme('dark')"
           >黑</view>
        </view>
      </view>
      <view class="menu-item" @click="logout">
        <text class="menu-label danger">退出登录</text>
        <text class="arrow">></text>
      </view>
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
.user-header {
  padding: 40rpx 40rpx 20rpx;
  margin-bottom: 20rpx;
}

.avatar-area {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.avatar-circle {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: var(--ink-text);
  border: 4rpx solid var(--ink-border);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.nickname {
  font-size: 40rpx;
  font-weight: 800;
  color: var(--ink-text);
}

.user-tag {
  display: inline-block;
  font-size: 20rpx;
  background: var(--ink-tag-bg);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  color: var(--ink-subtext);
  width: fit-content;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  padding: 0 10rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-num {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink-text);
}

.stat-label {
  font-size: 24rpx;
  color: var(--ink-subtext);
}

.menu-group {
  padding: 0 30rpx;
}

.menu-item {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid var(--ink-border);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-label {
  font-size: 30rpx;
  color: var(--ink-text);
}

.menu-label.danger {
  color: var(--ink-accent);
  font-weight: 600;
}

.menu-val {
  font-size: 26rpx;
  color: var(--ink-subtext);
}

.arrow {
  color: var(--ink-border);
  font-weight: 700;
}

.theme-switch-mini {
  display: flex;
  background: var(--ink-bg);
  padding: 4rpx;
  border-radius: 24rpx;
  border: 1rpx solid var(--ink-border);
}

.switch-opt {
  padding: 4rpx 20rpx;
  font-size: 22rpx;
  border-radius: 20rpx;
  color: var(--ink-subtext);
}

.switch-opt.active {
  background: var(--ink-text);
  color: var(--ink-bg);
}
</style>
