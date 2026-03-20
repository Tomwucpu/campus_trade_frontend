<template>
  <view class="app-page profile-page" :class="themeClass">
    <view class="profile-hero app-card">
      <view class="profile-top">
        <view class="profile-avatar">{{ profileInitial }}</view>
        <view class="profile-copy">
          <view class="profile-name">{{ displayName }}</view>
          <view class="profile-meta">{{ isLoggedIn ? '已登录，可查看订单与发布草稿' : '未登录，建议先登录后再继续' }}</view>
        </view>
      </view>

      <view class="stats-grid">
        <view v-for="item in stats" :key="item.label" class="stat-cell">
          <view class="stat-num">{{ item.value }}</view>
          <view class="stat-label">{{ item.label }}</view>
        </view>
      </view>
    </view>

    <view class="menu-card app-card">
      <view class="menu-item">
        <view class="menu-label">主题模式</view>
        <view class="theme-switch">
          <view
            class="switch-opt"
            :class="{ active: theme === 'light' }"
            @click="changeTheme('light')"
          >
            白描
          </view>
          <view
            class="switch-opt"
            :class="{ active: theme === 'dark' }"
            @click="changeTheme('dark')"
          >
            玄墨
          </view>
        </view>
      </view>

      <view class="menu-item" @click="go('/pages/order/list')">
        <view class="menu-label">我的订单</view>
        <view class="menu-value">查看交易记录</view>
      </view>

      <view class="menu-item" @click="go('/pages/goods/publish')">
        <view class="menu-label">发布草稿</view>
        <view class="menu-value">继续编辑闲置</view>
      </view>

      <view class="menu-item" @click="toggleLoginAction">
        <view class="menu-label danger">{{ isLoggedIn ? '退出登录' : '前往登录' }}</view>
        <view class="menu-value">{{ isLoggedIn ? '清除本地会话' : '进入登录页' }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getProfile } from '../../api/auth'
import { useAuthStore } from '../../store/auth'
import { setTheme, syncThemePage } from '../../utils/theme'

export default {
  data() {
    return {
      theme: 'light',
      themeClass: '',
      authStore: useAuthStore(),
      profile: {}
    }
  },
  computed: {
    isLoggedIn() {
      return this.authStore.sync().isLoggedIn()
    },
    displayName() {
      return this.profile.username || this.authStore.getDisplayName()
    },
    profileInitial() {
      return (this.displayName || '墨').slice(0, 1)
    },
    stats() {
      return [
        { label: '在售', value: this.isLoggedIn ? '12' : '--' },
        { label: '已成交', value: this.isLoggedIn ? '5' : '--' },
        { label: '收藏', value: this.isLoggedIn ? '8' : '--' },
        { label: '信用', value: this.isLoggedIn ? '优' : '--' }
      ]
    }
  },
  onLoad() {
    syncThemePage(this)
  },
  onShow() {
    syncThemePage(this)
    this.syncProfile()
  },
  methods: {
    syncProfile() {
      this.authStore.sync()
      this.profile = { ...this.authStore.profile }

      if (!this.authStore.isLoggedIn()) {
        return
      }

      getProfile()
        .then((res) => {
          if (res && res.code === 0) {
            this.profile = res.data || {}
            this.authStore.setProfile(this.profile)
            return
          }
          uni.showToast({ title: (res && res.message) || '资料加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '资料加载失败', icon: 'none' })
        })
    },
    changeTheme(nextTheme) {
      this.theme = setTheme(nextTheme)
      this.themeClass = this.theme === 'dark' ? 'theme-dark' : 'theme-light'
      uni.showToast({
        title: this.theme === 'dark' ? '已切换为玄墨主题' : '已切换为白描主题',
        icon: 'none'
      })
    },
    toggleLoginAction() {
      if (!this.isLoggedIn) {
        uni.navigateTo({ url: '/pages/user/login' })
        return
      }

      this.authStore.logout()
      this.profile = {}
      uni.showToast({ title: '已退出登录', icon: 'none' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/user/login' })
      }, 300)
    },
    go(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding-bottom: 40rpx;
}

.profile-hero,
.menu-card {
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 22rpx;
  margin-bottom: 28rpx;
}

.profile-avatar {
  width: 116rpx;
  height: 116rpx;
  border-radius: 50%;
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 42rpx;
}

.profile-name {
  font-family: var(--ink-font-title);
  font-size: 46rpx;
  color: var(--ink-text);
  margin-bottom: 12rpx;
}

.profile-meta {
  font-size: 24rpx;
  line-height: 1.75;
  color: var(--ink-subtext);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
}

.stat-cell {
  padding: 20rpx 10rpx;
  text-align: center;
  border-radius: 22rpx;
  background: var(--ink-accent-soft);
}

.stat-num {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 21rpx;
  color: var(--ink-subtext);
}

.menu-item {
  min-height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  border-bottom: 1rpx solid var(--ink-border);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-label {
  font-size: 29rpx;
  color: var(--ink-text);
}

.menu-label.danger {
  color: var(--ink-price);
}

.menu-value {
  font-size: 23rpx;
  color: var(--ink-subtext);
}

.theme-switch {
  display: flex;
  gap: 8rpx;
  padding: 8rpx;
  border-radius: 999rpx;
  background: var(--ink-accent-soft);
}

.switch-opt {
  min-width: 110rpx;
  text-align: center;
  padding: 14rpx 0;
  border-radius: 999rpx;
  font-size: 23rpx;
  color: var(--ink-subtext);
}

.switch-opt.active {
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
}
</style>
