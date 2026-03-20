<template>
  <view class="market-page profile-page" :class="themeClass">
    <view class="profile-hero safe-top">
      <view class="hero-orb hero-right"></view>
      <view class="hero-orb hero-left"></view>
      <view class="market-shell">
        <view class="profile-header">
          <view class="profile-avatar">{{ profileInitial }}</view>
          <view class="profile-copy">
            <view class="profile-name">{{ displayName }}</view>
            <view class="profile-meta">{{ profileSummary }}</view>
            <view class="profile-badges">
              <view class="profile-badge">认证学生</view>
              <view class="profile-badge">交易可信</view>
            </view>
          </view>
          <view class="profile-edit" @click="go('/pages/goods/publish')">编</view>
        </view>

        <view class="stats-grid">
          <view v-for="item in stats" :key="item.label" class="stat-item">
            <view class="stat-num">{{ item.value }}</view>
            <view class="stat-label">{{ item.label }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="market-shell profile-shell">
      <view class="market-card menu-card">
        <view class="menu-item" @click="go('/pages/goods/my')">
          <view class="menu-main">
            <view class="menu-icon">发</view>
            <text class="menu-text">我的发布</text>
          </view>
          <text class="menu-value">{{ profile.onSaleCount || 0 }}</text>
        </view>

        <view class="menu-item" @click="go('/pages/user/favorites')">
          <view class="menu-main">
            <view class="menu-icon">藏</view>
            <text class="menu-text">我的收藏</text>
          </view>
          <text class="menu-value">{{ favoriteCount }}</text>
        </view>

        <view class="menu-item" @click="go('/pages/user/messages')">
          <view class="menu-main">
            <view class="menu-icon">铃</view>
            <text class="menu-text">消息通知</text>
          </view>
          <text class="menu-value">{{ unreadCount }}</text>
        </view>

        <view class="menu-item" @click="go('/pages/order/list')">
          <view class="menu-main">
            <view class="menu-icon">单</view>
            <text class="menu-text">我的订单</text>
          </view>
          <text class="menu-value">{{ profile.orderCount || 0 }}</text>
        </view>
      </view>

      <view class="market-card menu-card">
        <view class="menu-item" @click="go('/pages/goods/publish')">
          <view class="menu-main">
            <view class="menu-icon light">+</view>
            <text class="menu-text">继续发布</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="menu-item" @click="toggleLoginAction">
          <view class="menu-main">
            <view class="menu-icon light">退</view>
            <text class="menu-text">{{ isLoggedIn ? '退出登录' : '前往登录' }}</text>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <AppTabBar active="profile" />
  </view>
</template>

<script>
import { getProfile } from '../../api/auth'
import AppTabBar from '../../components/AppTabBar.vue'
import { useAuthStore } from '../../store/auth'
import { getFavoriteGoodsIds, getUnreadMessageCount, maskPhone, maskStudentNo } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

function createEmptyProfile() {
  return {
    username: '',
    phone: '',
    studentNo: '',
    onSaleCount: 0,
    soldCount: 0,
    orderCount: 0
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
      favoriteCountValue: 0,
      unreadCountValue: 0
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
      return (this.displayName || '张').slice(0, 1)
    },
    profileSummary() {
      if (!this.isLoggedIn) {
        return '未登录，登录后可查看订单、收藏和发布信息。'
      }
      return `${maskPhone(this.profile.phone)} · ${maskStudentNo(this.profile.studentNo)}`
    },
    stats() {
      return [
        { label: '发布', value: this.isLoggedIn ? this.profile.onSaleCount || 0 : '--' },
        { label: '出售', value: this.isLoggedIn ? this.profile.soldCount || 0 : '--' },
        { label: '订单', value: this.isLoggedIn ? this.profile.orderCount || 0 : '--' }
      ]
    },
    favoriteCount() {
      return this.favoriteCountValue
    },
    unreadCount() {
      return this.unreadCountValue
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
      this.favoriteCountValue = getFavoriteGoodsIds().length
      this.unreadCountValue = getUnreadMessageCount()
      this.profile = {
        ...createEmptyProfile(),
        ...this.authStore.profile
      }

      if (!this.authStore.isLoggedIn()) {
        return
      }

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
    toggleLoginAction() {
      if (!this.isLoggedIn) {
        uni.navigateTo({ url: '/pages/user/login' })
        return
      }

      this.authStore.logout()
      this.profile = createEmptyProfile()
      this.favoriteCountValue = 0
      this.unreadCountValue = 0
      uni.showToast({ title: '已退出登录', icon: 'none' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/user/login' })
      }, 260)
    },
    go(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding-bottom: 180rpx;
}

.profile-hero {
  position: relative;
  padding-bottom: 150rpx;
  background: linear-gradient(135deg, #2d6a4f 0%, #1b5e20 100%);
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.hero-right {
  width: 260rpx;
  height: 260rpx;
  top: 60rpx;
  right: -50rpx;
}

.hero-left {
  width: 320rpx;
  height: 320rpx;
  left: -80rpx;
  bottom: -120rpx;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  position: relative;
  z-index: 1;
}

.profile-avatar {
  width: 118rpx;
  height: 118rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-copy {
  flex: 1;
}

.profile-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.profile-meta {
  font-size: 23rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 14rpx;
}

.profile-badges {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
}

.profile-badge {
  min-height: 40rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  display: flex;
  align-items: center;
  font-size: 20rpx;
}

.profile-edit {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 700;
}

.stats-grid {
  margin-top: 28rpx;
  padding: 22rpx 10rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  position: relative;
  z-index: 1;
}

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 34rpx;
  color: #ffffff;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 21rpx;
  color: rgba(255, 255, 255, 0.82);
}

.profile-shell {
  margin-top: -96rpx;
  position: relative;
  z-index: 2;
}

.menu-card {
  padding: 8rpx 24rpx;
  margin-bottom: 18rpx;
}

.menu-item {
  min-height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  border-bottom: 1rpx solid #f0f3f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-main {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.menu-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d6a4f;
  font-size: 28rpx;
  font-weight: 700;
}

.menu-icon.light {
  background: #f8f9fa;
}

.menu-text {
  font-size: 26rpx;
  color: #2c3e50;
}

.menu-value,
.menu-arrow {
  font-size: 23rpx;
  color: #6c757d;
}
</style>
