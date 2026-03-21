<template>
  <view class="market-page messages-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar">
        <view class="market-back-btn" @click="goBack">
          <text class="market-back-symbol">‹</text>
        </view>
        <view class="market-page-title">消息通知</view>
        <view class="mark-read" @click="markRead">全部已读</view>
      </view>
    </view>

    <view class="market-shell page-body">
      <view v-if="!messages.length" class="market-card empty-wrap">
        <EmptyState icon="铃" title="暂无消息" description="你的订单动态、审核结果和系统通知会展示在这里。" />
      </view>

      <view v-else class="message-list">
        <view
          v-for="item in messages"
          :key="item.id"
          class="market-card message-card"
          :class="{ unread: !item.isRead }"
        >
          <view class="message-icon" :style="{ background: getMeta(item.type).iconBg, color: getMeta(item.type).iconColor }">
            {{ getMeta(item.type).icon }}
          </view>
          <view class="message-main">
            <view class="message-head">
              <view class="message-title">{{ item.title }}</view>
              <view v-if="!item.isRead" class="message-dot"></view>
            </view>
            <view class="message-content">{{ item.content }}</view>
            <view class="message-time">{{ formatTime(item.createdAt) }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMessageList, markAllMessagesRead } from '../../api/message'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../store/auth'
import { formatRelativeTime, getMessageMeta } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      messages: []
    }
  },
  onLoad() {
    if (!this.ensureLogin()) {
      return
    }
    syncThemePage(this)
    this.refreshMessages()
  },
  onShow() {
    syncThemePage(this)
    if (this.authStore.sync().isLoggedIn()) {
      this.refreshMessages()
    }
  },
  methods: {
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      uni.showToast({ title: '请先登录后查看消息', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    refreshMessages() {
      getMessageList({
        pageNum: 1,
        pageSize: 50
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.messages = (res.data && res.data.records) || []
            return
          }
          this.messages = []
        })
        .catch(() => {
          this.messages = []
        })
    },
    getMeta(type) {
      return getMessageMeta(type)
    },
    formatTime(value) {
      return formatRelativeTime(value)
    },
    markRead() {
      markAllMessagesRead()
        .then((res) => {
          if (res && res.code === 0) {
            this.messages = this.messages.map((item) => ({ ...item, isRead: true }))
            uni.showToast({ title: res.message || '已全部标记为已读', icon: 'none' })
            return
          }
          uni.showToast({ title: (res && res.message) || '操作失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '操作失败', icon: 'none' })
        })
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/user/profile' })
        }
      })
    }
  }
}
</script>

<style scoped>
.messages-page {
  padding-bottom: 60rpx;
}

.page-topbar {
  margin-bottom: 18rpx;
}

.mark-read {
  font-size: 22rpx;
  color: #2d6a4f;
}

.page-body {
  padding-top: 12rpx;
}

.empty-wrap {
  padding: 12rpx;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.message-card {
  padding: 22rpx;
  display: flex;
  gap: 18rpx;
}

.message-card.unread {
  border-color: rgba(45, 106, 79, 0.18);
  background: rgba(232, 245, 233, 0.28);
}

.message-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.message-main {
  flex: 1;
  min-width: 0;
}

.message-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.message-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #2c3e50;
}

.message-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #f77f00;
}

.message-content {
  font-size: 24rpx;
  line-height: 1.8;
  color: #6c757d;
  margin-bottom: 10rpx;
}

.message-time {
  font-size: 21rpx;
  color: #adb5bd;
}
</style>
