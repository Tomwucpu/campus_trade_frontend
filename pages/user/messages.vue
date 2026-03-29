<template>
  <view class="market-page messages-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="topbar-wrap">
        <view class="topbar-left">
          <view class="market-back-btn back-btn-plain" hover-class="btn-hover" @click="goBack">
            <text class="market-back-symbol">‹</text>
          </view>
          <view class="market-page-title">消息通知</view>
        </view>
        <view class="topbar-right">
          <view class="mark-read-btn" hover-class="btn-hover-soft" @click="markRead">
            <text class="icon-font bi-check2 mark-read-icon"></text>
            <text class="mark-read-text">全部已读</text>
          </view>
          <view class="clear-btn" hover-class="btn-hover-soft" @click="clearAll">
            <text class="icon-font bi-trash3"></text>
          </view>
        </view>
      </view>
    </view>

    <view class="market-shell page-body">
      <view v-if="!messages.length" class="market-card empty-wrap">
        <EmptyState icon="bi bi-bell" title="暂无消息" description="你的订单动态、审核结果和系统通知会展示在这里。" />
      </view>

      <view v-else class="message-list" :class="{ clearing: isClearing }">
        <view
          v-for="(item, index) in messages"
          :key="item.id"
          class="message-card"
          :class="[typeClass(item.type), { unread: isUnread(item), ready: listAnimated, leaving: isLeaving(item.id) }]"
          :style="getCardStyle(index, item.id)"
        >
          <view class="card-close" hover-class="btn-hover-soft" @click.stop="removeMessage(item)">
            <text class="icon-font bi-x-lg"></text>
          </view>

          <view class="message-body">
            <view class="message-badge" :class="badgeClass(item.type)">{{ typeLabel(item.type) }}</view>
            <view class="message-main">
              <view class="message-title-row">
                <view class="message-title-inline">
                  <view class="message-title">{{ item.title }}</view>
                  <view v-if="isUnread(item)" class="message-dot"></view>
                </view>
              </view>

              <view class="message-content">{{ item.content }}</view>
              <view class="message-time">{{ formatTime(item.createdAt) }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { clearAllMessages, deleteMessage, getMessageList, markAllMessagesRead } from '../../api/message'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../store/auth'
import { formatRelativeTime } from '../../utils/market'
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
      messages: [],
      listAnimated: false,
      isClearing: false,
      leavingIds: [],
      entryTimer: null,
      staggerTimer: null,
      shouldStagger: false,
      clearTimer: null,
      removeTimers: {}
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
  onUnload() {
    this.clearAllTimers()
    uni.$emit('tabbar:refresh-unread')
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
      this.isClearing = false
      this.leavingIds = []
      this.clearRemoveTimers()
      getMessageList({
        pageNum: 1,
        pageSize: 50
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.messages = ((res.data && res.data.records) || []).map((item) => ({
              ...item,
              isRead: Boolean(item && (item.isRead === true || item.isRead === 1 || item.isRead === '1'))
            }))
            this.triggerListEntry()
            return
          }
          this.messages = []
          this.listAnimated = false
          this.shouldStagger = false
        })
        .catch(() => {
          this.messages = []
          this.listAnimated = false
          this.shouldStagger = false
        })
    },
    triggerListEntry() {
      clearTimeout(this.entryTimer)
      clearTimeout(this.staggerTimer)
      this.listAnimated = false
      this.shouldStagger = true
      this.$nextTick(() => {
        this.entryTimer = setTimeout(() => {
          this.listAnimated = true
          this.entryTimer = null
          this.staggerTimer = setTimeout(() => {
            this.shouldStagger = false
            this.staggerTimer = null
          }, 680)
        }, 20)
      })
    },
    typeKey(type) {
      const normalized = `${type || ''}`.trim().toUpperCase()
      if (normalized === 'ORDER') {
        return 'order'
      }
      if (normalized === 'AUDIT' || normalized === 'REVIEW') {
        return 'audit'
      }
      return 'system'
    },
    typeLabel(type) {
      const key = this.typeKey(type)
      if (key === 'order') {
        return '订单'
      }
      if (key === 'audit') {
        return '审核'
      }
      return '系统'
    },
    typeClass(type) {
      return `type-${this.typeKey(type)}`
    },
    badgeClass(type) {
      return `badge-${this.typeKey(type)}`
    },
    formatTime(value) {
      return formatRelativeTime(value)
    },
    isUnread(item) {
      return !(item && (item.isRead === true || item.isRead === 1 || item.isRead === '1'))
    },
    isLeaving(id) {
      return this.leavingIds.includes(`${id}`)
    },
    getCardStyle(index, id) {
      if (!this.shouldStagger || !this.listAnimated || this.isLeaving(id) || this.isClearing) {
        return {}
      }
      return {
        transitionDelay: `${Math.min(index, 8) * 55}ms`
      }
    },
    markRead() {
      if (!this.messages.length) {
        uni.showToast({ title: '当前没有消息', icon: 'none' })
        return
      }
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
    removeMessage(item) {
      if (!item || !item.id || this.isClearing) {
        return
      }
      const id = `${item.id}`
      if (this.isLeaving(id)) {
        return
      }
      deleteMessage(item.id)
        .then((res) => {
          if (res && res.code === 0) {
            this.leavingIds = [...this.leavingIds, id]
            this.removeTimers[id] = setTimeout(() => {
              this.messages = this.messages.filter((current) => `${current.id}` !== id)
              this.leavingIds = this.leavingIds.filter((currentId) => currentId !== id)
              clearTimeout(this.removeTimers[id])
              delete this.removeTimers[id]
              if (!this.messages.length) {
                this.listAnimated = false
              }
              uni.showToast({ title: res.message || '消息已删除', icon: 'none' })
            }, 220)
            return
          }
          uni.showToast({ title: (res && res.message) || '删除失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '删除失败', icon: 'none' })
        })
    },
    clearAll() {
      if (!this.messages.length) {
        uni.showToast({ title: '当前没有可清空的消息', icon: 'none' })
        return
      }
      uni.showModal({
        title: '一键清空',
        content: '清空后将删除你当前账号下的全部消息，确认继续吗？',
        success: ({ confirm }) => {
          if (!confirm) {
            return
          }
          clearAllMessages()
            .then((res) => {
              if (res && res.code === 0) {
                this.isClearing = true
                this.leavingIds = []
                this.clearRemoveTimers()
                clearTimeout(this.clearTimer)
                this.clearTimer = setTimeout(() => {
                  this.messages = []
                  this.isClearing = false
                  this.listAnimated = false
                  this.shouldStagger = false
                  this.clearTimer = null
                  uni.showToast({ title: res.message || '消息已清空', icon: 'none' })
                }, 240)
                return
              }
              uni.showToast({ title: (res && res.message) || '清空失败', icon: 'none' })
            })
            .catch(() => {
              uni.showToast({ title: '清空失败', icon: 'none' })
            })
        }
      })
    },
    clearRemoveTimers() {
      Object.keys(this.removeTimers).forEach((key) => {
        clearTimeout(this.removeTimers[key])
      })
      this.removeTimers = {}
    },
    clearAllTimers() {
      clearTimeout(this.entryTimer)
      clearTimeout(this.staggerTimer)
      clearTimeout(this.clearTimer)
      this.clearRemoveTimers()
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
  background: linear-gradient(180deg, #f1ede6 0%, #eee9e1 45%, #ece7df 100%);
  padding-bottom: calc(64rpx + env(safe-area-inset-bottom));
}

.topbar-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding-bottom: 18rpx;
  border-bottom: 1rpx solid rgba(188, 180, 166, 0.45);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 6rpx;
  min-width: 0;
}

.back-btn-plain {
  width: 56rpx;
  height: 56rpx;
  background: transparent;
  border: none;
  box-shadow: none;
}

.market-back-symbol {
  font-size: 36rpx;
  color: #362f25;
}

.market-page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2f281f;
  letter-spacing: 1rpx;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-shrink: 0;
}

.mark-read-btn,
.clear-btn,
.card-close,
.message-card {
  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 240ms ease,
    box-shadow 260ms ease,
    background-color 220ms ease,
    border-color 220ms ease;
}

.mark-read-btn {
  min-height: 62rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(188, 180, 166, 0.86);
  background: rgba(246, 242, 235, 0.96);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #5f564a;
  box-shadow: 0 8rpx 16rpx rgba(57, 47, 34, 0.06);
}

.mark-read-icon {
  font-size: 20rpx;
}

.mark-read-text {
  font-size: 23rpx;
}

.clear-btn {
  width: 62rpx;
  height: 62rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(188, 180, 166, 0.78);
  background: rgba(246, 242, 235, 0.92);
  color: #8f8577;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  box-shadow: 0 8rpx 16rpx rgba(57, 47, 34, 0.06);
}

.btn-hover {
  transform: scale(0.92);
  opacity: 0.78;
}

.btn-hover-soft {
  transform: scale(0.96);
  opacity: 0.84;
}

.page-body {
  padding-top: 22rpx;
}

.empty-wrap {
  margin-top: 12rpx;
  padding: 26rpx 22rpx;
  background: rgba(248, 244, 236, 0.95);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.message-card {
  position: relative;
  border-radius: 30rpx;
  padding: 24rpx 24rpx 22rpx;
  border: 1rpx solid rgba(206, 196, 182, 0.92);
  background: rgba(249, 245, 239, 0.95);
  box-shadow: 0 12rpx 24rpx rgba(56, 46, 34, 0.06);
  opacity: 0;
  transform: translateY(20rpx) scale(0.985);
}

.message-card.ready {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.message-card.unread {
  background: rgba(251, 247, 242, 0.98);
  box-shadow: 0 14rpx 28rpx rgba(56, 46, 34, 0.09);
}

.message-card.type-order.unread {
  border-color: rgba(146, 165, 117, 0.56);
}

.message-card.type-audit.unread {
  border-color: rgba(196, 151, 108, 0.58);
}

.message-card.type-system.unread {
  border-color: rgba(174, 165, 150, 0.56);
}

.message-card.leaving {
  opacity: 0;
  transform: translateX(26rpx) scale(0.96);
  transition-delay: 0ms !important;
  pointer-events: none;
}

.message-list.clearing .message-card {
  opacity: 0;
  transform: translateY(14rpx) scale(0.98);
}

.message-card:active {
  transform: translateY(0) scale(0.992);
}

.message-body {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  padding-right: 46rpx;
}

.message-main {
  flex: 1;
  min-width: 0;
}

.message-badge {
  min-width: 64rpx;
  height: 42rpx;
  border-radius: 20rpx;
  padding: 0 14rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1rpx;
  border: 1rpx solid transparent;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.badge-audit {
  color: #8f5c30;
  background: rgba(249, 230, 204, 0.9);
  border-color: rgba(226, 182, 130, 0.65);
}

.badge-order {
  color: #4e6643;
  background: rgba(219, 234, 206, 0.92);
  border-color: rgba(167, 196, 141, 0.68);
}

.badge-system {
  color: #6f6a62;
  background: rgba(227, 226, 223, 0.9);
  border-color: rgba(198, 194, 186, 0.68);
}

.card-close {
  position: absolute;
  top: 20rpx;
  right: 18rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  color: #a29a8d;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-title-inline {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;
}

.message-title {
  display: block;
  min-width: 0;
  max-width: 100%;
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: #2f281f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  margin-left: 10rpx;
  margin-top: 0;
  background: #b13d28;
  box-shadow: 0 0 0 5rpx rgba(177, 61, 40, 0.18);
  flex-shrink: 0;
}

.message-content {
  font-size: 13px;
  line-height: 1.46;
  color: #71675d;
  margin-bottom: 10rpx;
}

.message-time {
  font-size: 23rpx;
  color: #a39a8f;
}
</style>
