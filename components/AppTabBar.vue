<template>
  <view class="tabbar-wrap">
    <view class="tabbar-shell">
      <view class="tabbar-side">
        <view
          v-for="item in leftTabs"
          :key="item.key"
          class="tabbar-item"
          :class="{ active: isActive(item) }"
          @click="go(item)"
        >
          <view class="tabbar-icon-wrap">
            <uni-icons
              class="tabbar-icon"
              :type="resolveIcon(item)"
              :size="22"
              :color="resolveIconColor(item)"
            ></uni-icons>
          </view>
          <text class="tabbar-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="tabbar-center-gap"></view>

      <view class="tabbar-side">
        <view
          v-for="item in rightTabs"
          :key="item.key"
          class="tabbar-item"
          :class="{ active: isActive(item) }"
          @click="go(item)"
        >
          <view class="tabbar-icon-wrap">
            <uni-icons
              class="tabbar-icon"
              :type="resolveIcon(item)"
              :size="22"
              :color="resolveIconColor(item)"
            ></uni-icons>
            <view v-if="showBadge(item)" class="tabbar-badge">{{ formatBadge(totalUnreadCount) }}</view>
          </view>
          <text class="tabbar-label">{{ item.label }}</text>
        </view>
      </view>

      <view class="tabbar-publish" :class="{ active: isPublishActive }" @click="go(publishTab)">
        <view class="tabbar-publish-plus plus-horizontal"></view>
        <view class="tabbar-publish-plus plus-vertical"></view>
      </view>
    </view>
  </view>
</template>

<script>
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { getChatUnreadCount } from '../api/chat'
import { getUnreadMessageCount } from '../api/message'
import { useAuthStore } from '../store/auth'

export default {
  components: {
    UniIcons
  },
  props: {
    active: {
      type: String,
      default: 'home'
    }
  },
  data() {
    return {
      authStore: useAuthStore(),
      chatUnreadCountValue: 0,
      noticeUnreadCountValue: 0,
      tabs: [
        { key: 'home', label: '市集', path: '/pages/index/index' },
        { key: 'orders', label: '订单', path: '/pages/order/list' },
        { key: 'publish', label: '发布', path: '/pages/goods/publish' },
        { key: 'chat', label: '消息', path: '/pages/chat/list' },
        { key: 'profile', label: '我的', path: '/pages/user/profile' }
      ]
    }
  },
  computed: {
    leftTabs() {
      return this.tabs.slice(0, 2)
    },
    publishTab() {
      return this.tabs[2]
    },
    rightTabs() {
      return this.tabs.slice(3)
    },
    isPublishActive() {
      return this.active === this.publishTab.key
    },
    totalUnreadCount() {
      return Number(this.chatUnreadCountValue || 0) + Number(this.noticeUnreadCountValue || 0)
    }
  },
  mounted() {
    this.refreshUnreadCount()
    uni.$on('tabbar:refresh-unread', this.refreshUnreadCount)
  },
  beforeDestroy() {
    uni.$off('tabbar:refresh-unread', this.refreshUnreadCount)
  },
  methods: {
    isActive(item) {
      return this.active === item.key
    },
    resolveIcon(item) {
      const iconMap = {
        home: { default: 'home', active: 'home-filled' },
        orders: { default: 'wallet', active: 'wallet-filled' },
        chat: { default: 'chatboxes', active: 'chatboxes-filled' },
        profile: { default: 'person', active: 'person-filled' }
      }
      const matched = iconMap[item && item.key] || { default: 'circle', active: 'circle-filled' }
      return this.isActive(item) ? matched.active : matched.default
    },
    resolveIconColor(item) {
      return this.isActive(item) ? '#131517' : '#a6afb8'
    },
    showBadge(item) {
      return item.key === 'chat' && this.totalUnreadCount > 0
    },
    formatBadge(value) {
      const count = Number(value || 0)
      return count > 99 ? '99+' : `${count}`
    },
    refreshUnreadCount() {
      const authStore = this.authStore.sync()

      if (!authStore.isLoggedIn()) {
        this.chatUnreadCountValue = 0
        this.noticeUnreadCountValue = 0
        return
      }

      const profile = authStore.profile || {}
      this.noticeUnreadCountValue = Number(profile.unreadMessageCount || 0)
      this.fetchChatUnreadCount()
      this.fetchNoticeUnreadCount()
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
    fetchNoticeUnreadCount() {
      getUnreadMessageCount()
        .then((res) => {
          if (res && res.code === 0) {
            this.noticeUnreadCountValue = Number(res.data || 0)
            return
          }
          this.noticeUnreadCountValue = 0
        })
        .catch(() => {
          this.noticeUnreadCountValue = 0
        })
    },
    go(item) {
      if (!item || !item.path) {
        return
      }
      if (this.active === item.key && item.key !== 'publish') {
        return
      }
      uni.reLaunch({ url: item.path })
    }
  }
}
</script>

<style scoped>
.tabbar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
}

.tabbar-shell {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 18rpx 28rpx calc(18rpx + env(safe-area-inset-bottom));
  min-height: calc(118rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  border-top: 1rpx solid rgba(236, 239, 243, 0.92);
  box-shadow: 0 -10rpx 32rpx rgba(15, 23, 42, 0.06);
}

.tabbar-side {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10rpx;
}

.tabbar-center-gap {
  width: 156rpx;
  flex-shrink: 0;
}

.tabbar-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding-top: 6rpx;
  color: #a6afb8;
}

.tabbar-item.active {
  color: #131517;
}

.tabbar-icon-wrap {
  position: relative;
  width: 56rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabbar-icon {
  line-height: 1;
}

.tabbar-label {
  font-size: 20rpx;
  line-height: 1;
  font-weight: 500;
  color: currentColor;
  white-space: nowrap;
}

.tabbar-badge {
  position: absolute;
  top: -4rpx;
  right: -2rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 8rpx;
  border-radius: 999rpx;
  border: 4rpx solid #ffffff;
  background: #d9534f;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  font-weight: 700;
  line-height: 1;
}

.tabbar-publish {
  position: absolute;
  left: 50%;
  top: -30rpx;
  transform: translateX(-50%);
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  border: 8rpx solid #ffffff;
  background: #232323;
  box-shadow: 0 18rpx 34rpx rgba(35, 35, 35, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabbar-publish.active {
  background: #151515;
  box-shadow: 0 22rpx 40rpx rgba(21, 21, 21, 0.26);
}

.tabbar-publish-plus {
  position: absolute;
  width: 34rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.plus-vertical {
  transform: rotate(90deg);
}
</style>
