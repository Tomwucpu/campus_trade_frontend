<template>
  <view class="market-page chat-detail-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar">
        <view class="market-back-btn" @click="goBack">
          <text class="market-back-symbol">&lt;</text>
        </view>
        <view class="title-wrap">
          <view class="market-page-title title-main">{{ conversation.counterpartName || '聊天会话' }}</view>
          <view class="title-sub">{{ conversation.goodsTitle || '商品沟通' }}</view>
        </view>
        <view class="top-clear" @click="confirmClear">清空</view>
      </view>
    </view>

    <view class="market-shell summary-shell">
      <view class="market-card summary-card">
        <image v-if="summaryImageUrl" class="summary-thumb" :src="summaryImageUrl" mode="aspectFill"></image>
        <view v-else class="summary-thumb summary-thumb-placeholder">聊</view>
        <view class="summary-main">
          <view class="summary-title">{{ conversation.goodsTitle || '商品沟通' }}</view>
          <view class="summary-meta">{{ roleText }} · {{ timeHint }}</view>
        </view>
      </view>
    </view>

    <view class="market-shell messages-shell">
      <view v-if="!messages.length" class="market-card empty-wrap">
        <EmptyState icon="聊" title="还没有聊天内容" description="可以先确认商品成色、价格、交易时间和见面地点。" />
      </view>

      <view v-else class="message-list">
        <view
          v-for="item in messages"
          :id="`message-${item.id}`"
          :key="item.id"
          class="message-row"
          :class="{ self: item.isSelf }"
        >
          <view class="message-bubble">
            <view class="message-content">{{ item.content }}</view>
            <view class="message-time">{{ formatDate(item.createdAt) }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="composer-shell">
      <view class="market-shell composer-wrap">
        <view class="market-card composer-card">
          <textarea
            v-model="draft"
            class="composer-input"
            maxlength="500"
            auto-height
            :show-confirm-bar="false"
            placeholder="输入商品细节、交易时间或见面地点"
          />
          <button class="market-primary-btn send-btn" :disabled="sending || !trimmedDraft" @click="sendMessage">
            {{ sending ? '发送中' : '发送' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  clearConversationMessages,
  getConversationDetail,
  getConversationMessages,
  sendChatMessage
} from '../../api/chat'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../store/auth'
import { formatDateTime, resolveThumbUrl } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      id: '',
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      conversation: {},
      messages: [],
      draft: '',
      sending: false
    }
  },
  computed: {
    trimmedDraft() {
      return (this.draft || '').trim()
    },
    roleText() {
      return this.conversation && this.conversation.myRole === 'BUYER' ? '联系商家中' : '回复买家中'
    },
    summaryImageUrl() {
      return resolveThumbUrl(this.conversation.goodsThumbUrl || this.conversation.goodsImageUrl)
    },
    timeHint() {
      return this.conversation && this.conversation.lastMessageAt
        ? formatDateTime(this.conversation.lastMessageAt)
        : '刚进入会话'
    }
  },
  onLoad(options) {
    syncThemePage(this)
    if (!this.ensureLogin()) {
      return
    }
    this.id = (options && options.id) || ''
    if (!this.id) {
      uni.showToast({ title: '缺少会话编号', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/chat/list' }) })
      }, 260)
      return
    }
    this.refreshPage()
  },
  onShow() {
    syncThemePage(this)
  },
  onUnload() {
    uni.$emit('tabbar:refresh-unread')
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
    refreshPage() {
      this.fetchConversationDetail()
      this.fetchMessages()
    },
    fetchConversationDetail() {
      getConversationDetail(this.id)
        .then((res) => {
          if (res && res.code === 0) {
            this.conversation = res.data || {}
            return
          }
          uni.showToast({ title: (res && res.message) || '会话加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '会话加载失败', icon: 'none' })
        })
    },
    fetchMessages() {
      getConversationMessages(this.id, {
        pageNum: 1,
        pageSize: 100
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.messages = (res.data && res.data.records) || []
            this.scrollToBottom()
            return
          }
          this.messages = []
        })
        .catch(() => {
          this.messages = []
        })
    },
    sendMessage() {
      if (!this.trimmedDraft || this.sending) {
        return
      }

      this.sending = true
      sendChatMessage(this.id, { content: this.trimmedDraft })
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            this.messages = [...this.messages, res.data]
            this.draft = ''
            this.conversation = {
              ...this.conversation,
              lastMessage: res.data.content,
              lastMessageAt: res.data.createdAt
            }
            this.scrollToBottom()
            return
          }
          uni.showToast({ title: (res && res.message) || '发送失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '发送失败', icon: 'none' })
        })
        .finally(() => {
          this.sending = false
        })
    },
    confirmClear() {
      uni.showModal({
        title: '清空聊天记录',
        content: '清空后当前账号下将不再显示这段聊天记录，确认继续吗？',
        success: ({ confirm }) => {
          if (!confirm) {
            return
          }
          clearConversationMessages(this.id)
            .then((res) => {
              if (res && res.code === 0) {
                this.messages = []
                this.conversation = {
                  ...this.conversation,
                  lastMessage: ''
                }
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
    formatDate(value) {
      return formatDateTime(value)
    },
    scrollToBottom() {
      this.$nextTick(() => {
        setTimeout(() => {
          uni.pageScrollTo({
            scrollTop: 999999,
            duration: 0
          })
        }, 40)
      })
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/chat/list' })
        }
      })
    }
  }
}
</script>

<style scoped>
.chat-detail-page {
  padding-bottom: 230rpx;
}

.page-topbar {
  align-items: center;
  margin-bottom: 18rpx;
}

.title-wrap {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.title-main {
  margin-bottom: 6rpx;
}

.title-sub {
  font-size: 21rpx;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-clear {
  font-size: 22rpx;
  color: #d9485f;
  min-width: 72rpx;
  text-align: right;
}

.summary-shell {
  padding-top: 8rpx;
}

.summary-card {
  padding: 18rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.summary-thumb {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  background: #f4f6f8;
}

.summary-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d6a4f;
  font-size: 32rpx;
  font-weight: 700;
}

.summary-main {
  flex: 1;
  min-width: 0;
}

.summary-title {
  font-size: 27rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-meta {
  font-size: 22rpx;
  color: #6c757d;
}

.messages-shell {
  padding-top: 18rpx;
}

.empty-wrap {
  padding: 12rpx;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.message-row {
  display: flex;
}

.message-row.self {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 78%;
  padding: 18rpx 20rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid rgba(233, 236, 239, 0.9);
  box-shadow: 0 10rpx 24rpx rgba(25, 53, 79, 0.06);
}

.message-row.self .message-bubble {
  background: #e8f5e9;
  border-color: rgba(45, 106, 79, 0.18);
}

.message-content {
  font-size: 26rpx;
  line-height: 1.8;
  color: #2c3e50;
  word-break: break-all;
}

.message-time {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: #8b99a5;
  text-align: right;
}

.composer-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(12rpx + env(safe-area-inset-bottom));
  z-index: 20;
}

.composer-wrap {
  padding-bottom: 0;
}

.composer-card {
  padding: 18rpx;
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
}

.composer-input {
  flex: 1;
  max-height: 220rpx;
  padding: 18rpx 22rpx;
  border-radius: 22rpx;
  background: #f8f9fa;
  font-size: 26rpx;
  color: #2c3e50;
}

.send-btn {
  width: 148rpx;
  flex-shrink: 0;
}
</style>
