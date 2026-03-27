<template>
  <view class="market-page chat-list-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar">
        <view class="market-page-title">聊天消息</view>
        <view class="top-actions">
          <view class="top-link" @click="goNotice">通知</view>
          <view class="top-link" @click="refreshList">刷新</view>
        </view>
      </view>
    </view>

    <view class="market-shell page-body">
      <view v-if="!conversations.length" class="market-card empty-wrap">
        <EmptyState
          icon="聊"
          title="还没有聊天记录"
          description="浏览商品后点击“联系商家”，这里会保留你和卖家或买家的聊天会话。"
          buttonText="去逛逛"
          @action="goBrowse"
        />
      </view>

      <view v-else class="conversation-list">
        <view
          v-for="item in conversations"
          :key="item.id"
          class="market-card conversation-card"
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
      conversations: []
    }
  },
  onLoad() {
    syncThemePage(this)
    if (!this.ensureLogin()) {
      return
    }
    this.refreshList()
  },
  onShow() {
    syncThemePage(this)
    if (this.authStore.sync().isLoggedIn()) {
      this.refreshList()
    }
  },
  methods: {
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      uni.showToast({ title: '请先登录后查看聊天', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    refreshList() {
      getConversationList({
        pageNum: 1,
        pageSize: 50
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.conversations = (res.data && res.data.records) || []
            return
          }
          this.conversations = []
        })
        .catch(() => {
          this.conversations = []
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
}

.page-topbar {
  margin-bottom: 18rpx;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.top-link {
  font-size: 22rpx;
  color: #2d6a4f;
}

.page-body {
  padding-top: 12rpx;
}

.empty-wrap {
  padding: 12rpx;
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
}

.goods-thumb {
  width: 112rpx;
  height: 112rpx;
  border-radius: 22rpx;
  flex-shrink: 0;
  background: #f4f6f8;
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
}
</style>
