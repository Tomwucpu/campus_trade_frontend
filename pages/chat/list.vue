<template>
  <view class="market-page chat-list-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar" :class="{ 'topbar-ready': topbarReady }">
        <view class="headline-wrap">
          <view class="market-page-title title-main">消息</view>
        </view>
        <view
          class="notice-btn"
          hover-class="notice-btn-hover"
          hover-stay-time="120"
          @click="goNotice"
          @longpress="refreshList(true)"
        >
          <text class="icon-font bi bi-bell notice-icon"></text>
          <view v-if="hasUnread" class="notice-dot active"></view>
        </view>
      </view>
    </view>

    <view class="market-shell page-body">
      <view v-if="conversationLoading && !conversations.length" class="market-card loading-wrap">
        <text class="icon-font bi bi-arrow-repeat loading-icon"></text>
        <text class="loading-title">聊天记录加载中...</text>
        <text class="loading-subtitle">正在同步最近会话和未读消息</text>
      </view>

      <view v-else-if="!conversations.length" class="market-card empty-wrap">
        <EmptyState
          icon="bi bi-chat-left-text"
          title="还没有聊天记录"
          description="浏览商品后点击“联系商家”，这里会保留你和卖家或买家的聊天会话。"
          buttonText="去逛逛"
          @action="goBrowse"
        />
      </view>

      <view v-else class="conversation-list" :class="{ 'list-ready': listReady }">
        <view
          v-for="(item, index) in conversations"
          :key="item.id"
          class="market-card conversation-card"
          :style="conversationStyle(index)"
          @click="openConversation(item)"
        >
          <image
            v-if="item.goodsImageUrl"
            class="goods-thumb"
            :src="resolveConversationImage(item.goodsThumbUrl || item.goodsImageUrl)"
            mode="aspectFill"
          ></image>
          <view v-else class="goods-thumb goods-thumb-placeholder">聊</view>

          <view class="conversation-main">
            <view class="conversation-head">
              <view class="conversation-title-row">
                <text class="conversation-name">{{ conversationName(item) }}</text>
                <text class="market-tag muted role-tag">{{ roleText(item) }}</text>
              </view>
              <view class="conversation-time">{{ formatTime(item.lastMessageAt) }}</view>
            </view>

            <view class="conversation-goods">{{ item.goodsTitle || '商品沟通' }}</view>

            <view class="conversation-foot">
              <view class="conversation-preview">{{ item.lastMessage || '点击进入会话，继续沟通商品细节。' }}</view>
              <view v-if="item.unreadCount" class="conversation-badge">{{ formatBadge(item.unreadCount) }}</view>
            </view>
          </view>

          <view class="conversation-clear" @click.stop="confirmClear(item)">清空</view>
        </view>
      </view>
    </view>

    <AppTabBar active="chat" />
  </view>
</template>

<script>
import { clearConversationMessages, getConversationList } from '../../api/chat'
import { getUnreadMessageCount } from '../../api/message'
import AppTabBar from '../../components/AppTabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../store/auth'
import { formatRelativeTime, resolveThumbUrl } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    AppTabBar,
    EmptyState
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      conversations: [],
      conversationLoading: true,
      activeConversationRequestId: 0,
      noticeUnreadCount: 0,
      topbarReady: false,
      listReady: false,
      shouldStagger: false,
      topbarTimer: null,
      listEntryTimer: null,
      listStaggerTimer: null
    }
  },
  computed: {
    hasUnread() {
      return Number(this.noticeUnreadCount || 0) > 0
    }
  },
  watch: {
    conversations() {
      this.triggerListEntry()
    }
  },
  onLoad() {
    syncThemePage(this)
    if (!this.ensureLogin()) {
      return
    }
    this.fetchNoticeUnreadCount()
    this.refreshList()
  },
  onReady() {
    this.startTopbarEntry()
  },
  onShow() {
    syncThemePage(this)
    if (this.authStore.sync().isLoggedIn()) {
      this.fetchNoticeUnreadCount()
      this.refreshList()
      return
    }
    this.noticeUnreadCount = 0
  },
  onUnload() {
    this.clearTimers()
  },
  methods: {
    startTopbarEntry() {
      clearTimeout(this.topbarTimer)
      this.topbarReady = false
      this.$nextTick(() => {
        this.topbarTimer = setTimeout(() => {
          this.topbarReady = true
          this.topbarTimer = null
        }, 26)
      })
    },
    triggerListEntry() {
      clearTimeout(this.listEntryTimer)
      clearTimeout(this.listStaggerTimer)
      this.listReady = false
      this.shouldStagger = Boolean(this.conversations.length)
      if (!this.conversations.length) {
        return
      }
      this.$nextTick(() => {
        this.listEntryTimer = setTimeout(() => {
          this.listReady = true
          this.listEntryTimer = null
          this.listStaggerTimer = setTimeout(() => {
            this.shouldStagger = false
            this.listStaggerTimer = null
          }, 760)
        }, 22)
      })
    },
    conversationStyle(index) {
      if (!this.shouldStagger || !this.listReady) {
        return {}
      }
      return {
        transitionDelay: `${Math.min(index, 7) * 52}ms`
      }
    },
    clearTimers() {
      clearTimeout(this.topbarTimer)
      clearTimeout(this.listEntryTimer)
      clearTimeout(this.listStaggerTimer)
      this.topbarTimer = null
      this.listEntryTimer = null
      this.listStaggerTimer = null
    },
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      this.conversationLoading = false
      uni.showToast({ title: '请先登录后查看聊天', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    refreshList(showFeedback = false) {
      const requestId = ++this.activeConversationRequestId
      this.conversationLoading = true
      getConversationList({
        pageNum: 1,
        pageSize: 50
      })
        .then((res) => {
          if (requestId !== this.activeConversationRequestId) {
            return
          }
          if (res && res.code === 0) {
            this.conversations = (res.data && res.data.records) || []
            if (showFeedback) {
              uni.showToast({ title: '会话已更新', icon: 'none' })
            }
            return
          }
          this.conversations = []
          if (showFeedback) {
            uni.showToast({ title: (res && res.message) || '刷新失败', icon: 'none' })
          }
        })
        .catch(() => {
          if (requestId !== this.activeConversationRequestId) {
            return
          }
          this.conversations = []
          if (showFeedback) {
            uni.showToast({ title: '刷新失败', icon: 'none' })
          }
        })
        .finally(() => {
          if (requestId !== this.activeConversationRequestId) {
            return
          }
          this.conversationLoading = false
        })
    },
    fetchNoticeUnreadCount() {
      getUnreadMessageCount()
        .then((res) => {
          if (res && res.code === 0) {
            this.noticeUnreadCount = Number(res.data || 0)
            return
          }
          this.noticeUnreadCount = 0
        })
        .catch(() => {
          this.noticeUnreadCount = 0
        })
    },
    roleText(item) {
      return item && item.myRole === 'BUYER' ? '联系商家' : '买家咨询'
    },
    conversationName(item) {
      if (item && item.counterpartName) {
        return item.counterpartName
      }
      return item && item.myRole === 'BUYER' ? '卖家' : '买家'
    },
    formatTime(value) {
      return formatRelativeTime(value)
    },
    formatBadge(value) {
      const count = Number(value || 0)
      return count > 99 ? '99+' : `${count}`
    },
    resolveConversationImage(url) {
      return resolveThumbUrl(url)
    },
    openConversation(item) {
      if (!item || !item.id) {
        return
      }
      uni.navigateTo({ url: `/pages/chat/detail?id=${item.id}` })
    },
    confirmClear(item) {
      if (!item || !item.id) {
        return
      }
      uni.showModal({
        title: '清空聊天记录',
        content: '清空后当前账号下将不再显示这段聊天记录，确认继续吗？',
        success: ({ confirm }) => {
          if (!confirm) {
            return
          }
          clearConversationMessages(item.id)
            .then((res) => {
              if (res && res.code === 0) {
                this.conversations = this.conversations.filter((current) => current.id !== item.id)
                uni.showToast({ title: res.message || '聊天记录已清空', icon: 'none' })
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
    goNotice() {
      uni.navigateTo({ url: '/pages/user/messages' })
    },
    goBrowse() {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
}
</script>

<style scoped>
.chat-list-page {
  padding-bottom: 180rpx;
  background: linear-gradient(180deg, rgba(233, 228, 219, 0.95) 0rpx, rgba(233, 228, 219, 0.58) 156rpx, transparent 320rpx);
}

.theme-dark.chat-list-page {
  background: linear-gradient(180deg, rgba(48, 44, 40, 0.82) 0rpx, rgba(48, 44, 40, 0.18) 156rpx, transparent 320rpx);
}

.page-topbar {
  padding: 4rpx 2rpx 10rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: opacity 360ms ease, transform 360ms cubic-bezier(0.2, 0.72, 0.25, 1);
}

.page-topbar.topbar-ready {
  opacity: 1;
  transform: translateY(0);
}

.headline-wrap {
  flex: 1;
  min-width: 0;
}

.title-main {
  font-size: 62rpx;
  line-height: 1.08;
  font-weight: 500;
  letter-spacing: 4rpx;
  color: #16130f;
  font-family: "Songti SC", "STSong", "SimSun", serif;
}

.theme-dark .title-main {
  color: #f1ece4;
}

.notice-btn {
  width: 82rpx;
  height: 82rpx;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(225, 220, 210, 0.98);
  border: 1rpx solid rgba(200, 193, 181, 0.8);
  box-shadow: 0 12rpx 26rpx rgba(39, 35, 30, 0.12);
  transition: transform 220ms ease, box-shadow 220ms ease, background-color 220ms ease;
  animation: bell-float 3.4s ease-in-out infinite;
}

.theme-dark .notice-btn {
  background: rgba(85, 80, 73, 0.9);
  border-color: rgba(120, 110, 102, 0.7);
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.28);
}

.notice-btn-hover,
.notice-btn:active {
  transform: scale(0.94);
  box-shadow: 0 8rpx 18rpx rgba(39, 35, 30, 0.18);
  background: rgba(214, 207, 196, 0.98);
}

.notice-icon {
  font-size: 40rpx;
  color: #211d19;
}

.theme-dark .notice-icon {
  color: #f5f1ea;
}

.notice-dot {
  position: absolute;
  right: 13rpx;
  top: 15rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #9b3a32;
  border: 2rpx solid rgba(243, 237, 228, 0.92);
  opacity: 0.72;
  transform: scale(0.88);
}

.notice-dot.active {
  opacity: 1;
  transform: scale(1);
  animation: dot-pulse 1.5s ease-in-out infinite;
}

.page-body {
  padding-top: 12rpx;
}

.empty-wrap {
  padding: 12rpx;
}

.loading-wrap {
  min-height: 320rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}

.loading-icon {
  font-size: 42rpx;
  color: #7d756a;
  animation: spinnerRotate 0.9s linear infinite;
}

.loading-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2a241d;
}

.loading-subtitle {
  font-size: 23rpx;
  color: #8f867b;
}

.theme-dark .loading-icon {
  color: #c8beb1;
}

.theme-dark .loading-title {
  color: #f3ede4;
}

.theme-dark .loading-subtitle {
  color: #b8afa3;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.conversation-card {
  padding: 22rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  opacity: 0;
  transform: translateY(24rpx) scale(0.985);
  transition: transform 420ms cubic-bezier(0.2, 0.74, 0.2, 1), opacity 420ms ease, box-shadow 220ms ease;
  will-change: transform, opacity;
}

.conversation-list.list-ready .conversation-card {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.conversation-card:active {
  transform: translateY(0) scale(0.985);
  box-shadow: 0 8rpx 24rpx rgba(39, 35, 30, 0.12);
}

.goods-thumb {
  width: 112rpx;
  height: 112rpx;
  border-radius: 22rpx;
  flex-shrink: 0;
  background: #f4f6f8;
  transition: transform 260ms ease;
}

.conversation-card:active .goods-thumb {
  transform: scale(0.96);
}

.goods-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d6a4f;
  font-size: 36rpx;
  font-weight: 700;
}

.conversation-main {
  flex: 1;
  min-width: 0;
}

.conversation-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
  margin-bottom: 10rpx;
}

.conversation-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.conversation-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #2c3e50;
}

.role-tag {
  min-height: 40rpx;
  padding: 0 14rpx;
}

.conversation-time {
  font-size: 21rpx;
  color: #adb5bd;
  flex-shrink: 0;
}

.conversation-goods {
  font-size: 23rpx;
  color: #2d6a4f;
  margin-bottom: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-foot {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.conversation-preview {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-badge {
  min-width: 38rpx;
  height: 38rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: #f77f00;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
  flex-shrink: 0;
}

.conversation-clear {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #d9485f;
  transition: transform 180ms ease, color 180ms ease;
}

.conversation-clear:active {
  transform: scale(0.93);
  color: #bf2f47;
}

@keyframes bell-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4rpx);
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(155, 58, 50, 0.45);
  }
  50% {
    box-shadow: 0 0 0 10rpx rgba(155, 58, 50, 0);
  }
}

@keyframes spinnerRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 360px) {
  .title-main {
    font-size: 56rpx;
    letter-spacing: 2rpx;
  }
}
</style>
