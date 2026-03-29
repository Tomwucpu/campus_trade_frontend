<template>
  <view class="market-page profile-page" :class="themeClass">
    <view class="profile-hero safe-top">
      <view class="market-shell">
        <view class="hero-card">
          <view class="hero-header">
            <view class="avatar-ring">
              <view class="avatar-core">
                <text class="bi bi-mortarboard-fill icon-font avatar-symbol"></text>
              </view>
            </view>

            <view class="hero-copy">
              <view class="hero-name">{{ displayName }}</view>
              <view class="hero-meta">{{ profileSummary }}</view>
            </view>

            <view class="hero-action" @click="go('/pages/goods/publish')">
              <text class="bi bi-pencil-square icon-font hero-action-icon"></text>
            </view>
          </view>

          <view class="hero-stats">
            <view v-for="item in stats" :key="item.label" class="hero-stat">
              <view class="hero-stat-value">{{ item.value }}</view>
              <view class="hero-stat-label">{{ item.label }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="market-shell profile-shell">
      <view class="notice-card" @click="go('/pages/user/messages')">
        <view class="notice-count" :class="{ muted: !isLoggedIn || totalUnreadCount <= 0 }">
          {{ formatBadge(totalUnreadCount) }}
        </view>
        <text class="notice-text">{{ unreadSummaryText }}</text>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="go('/pages/goods/my')">
          <view class="menu-main">
            <view class="menu-icon-wrap">
              <text class="bi bi-box-seam icon-font menu-icon-font"></text>
            </view>
            <text class="menu-text">我的发布</text>
          </view>
          <view class="menu-right">
            <text class="bi bi-chevron-right icon-font arrow-icon"></text>
          </view>
        </view>

        <view class="menu-item" @click="go('/pages/user/favorites')">
          <view class="menu-main">
            <view class="menu-icon-wrap">
              <text class="bi bi-heart icon-font menu-icon-font"></text>
            </view>
            <text class="menu-text">我的收藏</text>
          </view>
          <view class="menu-right">
            <view v-if="favoriteCount > 0" class="menu-badge">{{ formatBadge(favoriteCount) }}</view>
            <text class="bi bi-chevron-right icon-font arrow-icon"></text>
          </view>
        </view>

        <view class="menu-item" @click="go('/pages/order/list')">
          <view class="menu-main">
            <view class="menu-icon-wrap">
              <text class="bi bi-bag-check icon-font menu-icon-font"></text>
            </view>
            <text class="menu-text">我的订单</text>
          </view>
          <view class="menu-right">
            <text class="bi bi-chevron-right icon-font arrow-icon"></text>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="go('/pages/chat/list')">
          <view class="menu-main">
            <view class="menu-icon-wrap">
              <text class="bi bi-chat-left-dots icon-font menu-icon-font"></text>
            </view>
            <text class="menu-text">聊天消息</text>
          </view>
          <view class="menu-right">
            <view v-if="chatUnreadCount > 0" class="menu-badge">{{ formatBadge(chatUnreadCount) }}</view>
            <text class="bi bi-chevron-right icon-font arrow-icon"></text>
          </view>
        </view>

        <view class="menu-item" @click="go('/pages/user/messages')">
          <view class="menu-main">
            <view class="menu-icon-wrap">
              <text class="bi bi-bell icon-font menu-icon-font"></text>
            </view>
            <text class="menu-text">消息通知</text>
          </view>
          <view class="menu-right">
            <view v-if="unreadCount > 0" class="menu-badge">{{ formatBadge(unreadCount) }}</view>
            <text class="bi bi-chevron-right icon-font arrow-icon"></text>
          </view>
        </view>

        <view class="menu-item" @click="go('/pages/goods/publish')">
          <view class="menu-main">
            <view class="menu-icon-wrap">
              <text class="bi bi-plus-circle icon-font menu-icon-font"></text>
            </view>
            <text class="menu-text">继续发布</text>
          </view>
          <view class="menu-right">
            <text class="bi bi-chevron-right icon-font arrow-icon"></text>
          </view>
        </view>
      </view>

      <view class="auth-card" @click="toggleLoginAction">
        <view class="auth-inner">
          <text class="icon-font auth-icon" :class="isLoggedIn ? 'bi bi-box-arrow-right' : 'bi bi-box-arrow-in-right'"></text>
          <text class="auth-text">{{ loginActionText }}</text>
        </view>
      </view>
    </view>

    <AppTabBar active="profile" />
  </view>
</template>

<script>
import { getProfile } from '../../api/auth'
import { getChatUnreadCount } from '../../api/chat'
import AppTabBar from '../../components/AppTabBar.vue'
import { useAuthStore } from '../../store/auth'
import { maskPhone, maskStudentNo } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

function createEmptyProfile() {
  return {
    username: '',
    phone: '',
    studentNo: '',
    onSaleCount: 0,
    soldCount: 0,
    orderCount: 0,
    favoriteCount: 0,
    unreadMessageCount: 0
  }
}

export default {
  components: {
    AppTabBar
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      profile: createEmptyProfile(),
      chatUnreadCountValue: 0
    }
  },
  computed: {
    isLoggedIn() {
      return this.authStore.sync().isLoggedIn()
    },
    loginActionText() {
      return this.isLoggedIn ? '退出登录' : '前往登录'
    },
    displayName() {
      return this.profile.username || this.authStore.getDisplayName()
    },
    profileSummary() {
      if (!this.isLoggedIn) {
        return '未登录，登录后可查看订单、收藏、聊天和发布信息。'
      }
      return `${maskPhone(this.profile.phone)} / ${maskStudentNo(this.profile.studentNo)}`
    },
    stats() {
      return [
        { label: '发布', value: this.isLoggedIn ? this.profile.onSaleCount || 0 : '--' },
        { label: '售出', value: this.isLoggedIn ? this.profile.soldCount || 0 : '--' },
        { label: '订单', value: this.isLoggedIn ? this.profile.orderCount || 0 : '--' }
      ]
    },
    favoriteCount() {
      return this.profile.favoriteCount || 0
    },
    chatUnreadCount() {
      return this.chatUnreadCountValue || 0
    },
    unreadCount() {
      return this.profile.unreadMessageCount || 0
    },
    totalUnreadCount() {
      return Number(this.chatUnreadCount || 0) + Number(this.unreadCount || 0)
    },
    unreadSummaryText() {
      if (!this.isLoggedIn) {
        return '登录后查看消息提醒'
      }
      if (this.totalUnreadCount <= 0) {
        return '暂无未读消息'
      }
      return `${this.totalUnreadCount} 条未读消息`
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
      this.profile = {
        ...createEmptyProfile(),
        ...this.authStore.profile
      }

      if (!this.authStore.isLoggedIn()) {
        this.chatUnreadCountValue = 0
        return
      }

      this.fetchChatUnreadCount()
      getProfile()
        .then((res) => {
          if (res && res.code === 0) {
            this.profile = { ...createEmptyProfile(), ...(res.data || {}) }
            this.authStore.setProfile(this.profile)
            return
          }
          uni.showToast({ title: (res && res.message) || '资料加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '资料加载失败', icon: 'none' })
        })
    },
    fetchChatUnreadCount() {
      getChatUnreadCount()
        .then((res) => {
          this.chatUnreadCountValue = res && res.code === 0 ? Number(res.data || 0) : 0
        })
        .catch(() => {
          this.chatUnreadCountValue = 0
        })
    },
    toggleLoginAction() {
      if (!this.isLoggedIn) {
        uni.navigateTo({ url: '/pages/user/login' })
        return
      }

      this.authStore.logout()
      this.profile = createEmptyProfile()
      this.chatUnreadCountValue = 0
      uni.showToast({ title: '已退出登录', icon: 'none' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/user/login' })
      }, 260)
    },
    go(url) {
      uni.navigateTo({ url })
    },
    formatBadge(value) {
      const count = Number(value || 0)
      if (count <= 0) {
        return '0'
      }
      return count > 99 ? '99+' : `${count}`
    }
  }
}
</script>

<style scoped>
.profile-page {
  background: var(--campus-page-bg);
  padding-bottom: 180rpx;
}

.profile-hero {
  padding-bottom: 8rpx;
}

.icon-font {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-style: normal;
}

.hero-card {
  border-radius: 34rpx;
  padding: 34rpx 30rpx 28rpx;
  background: linear-gradient(125deg, #302c29 0%, #23201d 100%);
  box-shadow: 0 22rpx 44rpx rgba(24, 18, 13, 0.22);
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar-ring {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-core {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(49, 35, 74, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-symbol {
  color: #f2c361;
  font-size: 34rpx;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #f9f6f2;
  margin-bottom: 10rpx;
}

.hero-meta {
  font-size: 24rpx;
  line-height: 1.4;
  color: #cec4ba;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-action {
  width: 66rpx;
  height: 66rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-action-icon {
  color: #ddd8d3;
  font-size: 28rpx;
}

.hero-stats {
  margin-top: 34rpx;
  padding-top: 6rpx;
  display: flex;
  align-items: center;
}

.hero-stat {
  flex: 1;
  text-align: center;
  position: relative;
}

.hero-stat:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20rpx;
  bottom: 20rpx;
  width: 1rpx;
  background: rgba(255, 255, 255, 0.12);
}

.hero-stat-value {
  font-size: 48rpx;
  line-height: 1.1;
  color: #f9f5f1;
  font-weight: 700;
}

.hero-stat-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #cbbfb2;
}

.profile-shell {
  margin-top: 20rpx;
}

.notice-card {
  min-height: 74rpx;
  border-radius: 24rpx;
  border: 1rpx solid #d8cfc4;
  background: rgba(247, 243, 237, 0.95);
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 24rpx;
  margin-bottom: 22rpx;
}

.notice-count {
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: #ab4338;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
}

.notice-count.muted {
  background: #c8beb3;
}

.notice-text {
  font-size: 26rpx;
  color: #5f5346;
}

.menu-group {
  border-radius: 26rpx;
  border: 1rpx solid #d8cfc4;
  background: rgba(247, 243, 237, 0.95);
  overflow: hidden;
  margin-bottom: 22rpx;
}

.menu-item {
  min-height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx 0 22rpx;
  border-bottom: 1rpx solid #ddd4ca;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-main {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.menu-icon-wrap {
  width: 62rpx;
  height: 62rpx;
  border-radius: 20rpx;
  background: #ece5db;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon-font {
  color: #7d7164;
  font-size: 27rpx;
}

.menu-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #2e2923;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.arrow-icon {
  color: #b7ad9f;
  font-size: 24rpx;
}

.menu-badge {
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 11rpx;
  border-radius: 999rpx;
  background: #ab4338;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 1;
}

.auth-card {
  min-height: 92rpx;
  border-radius: 24rpx;
  border: 1rpx solid #d8cfc4;
  background: rgba(247, 243, 237, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #8f7c67;
}

.auth-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin: 0 auto;
}

.auth-text {
  font-size: 31rpx;
  font-weight: 600;
  color: #8f7c67;
  line-height: 1;
}

.auth-icon {
  color: #8f7c67;
  font-size: 36rpx;
  width: 30rpx;
  text-align: center;
}

.profile-page :deep(.tabbar-shell) {
  background: rgba(255, 255, 255, 0.94);
}

@media (min-width: 900px) {
  .profile-page {
    max-width: 760rpx;
    margin: 0 auto;
  }

  .hero-card {
    border-radius: 28rpx;
  }

  .menu-text {
    font-size: 29rpx;
  }
}
</style>
