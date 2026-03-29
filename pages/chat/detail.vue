<template>
  <view class="market-page chat-detail-page" :class="themeClass">
    <view class="chat-bg-glow glow-top"></view>
    <view class="chat-bg-glow glow-bottom"></view>

    <view class="market-shell safe-top">
      <view class="chat-header" :class="{ 'header-ready': headerReady }">
        <view class="market-back-btn chat-back-btn" hover-class="press-in" hover-stay-time="120" @click="goBack">
          <text class="icon-font bi bi-chevron-left back-icon"></text>
        </view>

        <view class="header-main">
          <view class="header-name">{{ conversation.counterpartName || '聊天会话' }}</view>
          <view class="header-sub">最近活跃</view>
        </view>

        <view class="header-action" hover-class="press-in" hover-stay-time="120" @click="openClearDialog">
          <text class="icon-font bi bi-trash3"></text>
        </view>
      </view>
    </view>

    <view class="market-shell goods-shell">
      <view
        class="goods-context-card"
        :class="{ 'summary-ready': summaryReady }"
        hover-class="press-soft"
        hover-stay-time="120"
        @click="goGoodsDetail"
      >
        <image v-if="summaryImageUrl" class="goods-thumb" :src="summaryImageUrl" mode="aspectFill"></image>
        <view v-else class="goods-thumb goods-thumb-placeholder">{{ counterpartInitial }}</view>

        <view class="goods-main">
          <view class="goods-title">{{ conversation.goodsTitle || '商品沟通' }}</view>
          <view class="goods-meta">
            <text class="goods-price">{{ goodsPriceText }}</text>
            <text class="goods-hint">{{ roleText }} · {{ timeHint }}</text>
          </view>
        </view>

        <view v-if="showGoodsStatus" class="goods-status">{{ goodsStatusText }}</view>
      </view>
    </view>

    <view class="market-shell messages-shell">
      <view v-if="!messages.length" class="empty-panel" :class="{ 'messages-ready': messagesReady }">
        <view class="empty-title">还没有聊天内容</view>
        <view class="empty-desc">可以先确认商品成色、价格、交易时间和见面地点。</view>
      </view>

      <view v-else class="message-list" :class="{ 'messages-ready': messagesReady }">
        <view
          v-for="(item, index) in messages"
          :id="`message-${item.id}`"
          :key="item.id"
          class="message-block"
          :class="{ 'message-pop': isPopMessage(item) }"
          :style="messageStyle(index)"
        >
          <view v-if="showTimeTag(index)" class="time-row">
            <view class="time-pill">{{ formatDate(item.createdAt) }}</view>
          </view>

          <view class="message-row" :class="{ self: item.isSelf }">
            <view class="message-avatar">{{ item.isSelf ? '我' : counterpartInitial }}</view>
            <view class="message-bubble-wrap">
              <view class="message-bubble">{{ item.content }}</view>
            </view>
          </view>
        </view>
        <view id="chat-bottom-anchor" class="bottom-anchor"></view>
      </view>
    </view>

    <view class="composer-shell" :class="{ 'composer-ready': composerReady }">
      <view class="market-shell composer-wrap">
        <view class="composer-card">
          <view class="composer-input-wrap" :class="{ focused: inputFocused }">
            <input
              v-model="draft"
              class="composer-input"
              maxlength="500"
              type="text"
              confirm-type="send"
              placeholder="发消息..."
              @focus="onInputFocus"
              @blur="onInputBlur"
              @confirm="sendMessage"
            />
          </view>

          <button
            class="send-btn"
            :class="{ active: canSend, sending: sending }"
            :disabled="!canSend || sending"
            hover-class="send-btn-hover"
            hover-stay-time="120"
            @click="sendMessage"
          >
            <text class="icon-font bi" :class="sending ? 'bi-arrow-repeat' : 'bi-send-fill'"></text>
          </button>
        </view>
      </view>
    </view>

    <view v-if="showClearConfirm" class="confirm-mask" :class="{ 'mask-ready': clearDialogReady }" @tap="closeClearDialog">
      <view class="confirm-card" :class="{ 'card-ready': clearDialogReady }" @tap.stop="">
        <view class="confirm-head">
          <view class="confirm-title">清空会话？</view>
          <view class="confirm-text">清空后聊天记录将无法恢复，是否继续？</view>
        </view>
        <view class="confirm-actions">
          <view class="confirm-btn cancel" hover-class="press-in" hover-stay-time="120" @click="closeClearDialog">取消</view>
          <view class="confirm-divider"></view>
          <view class="confirm-btn danger" hover-class="press-in" hover-stay-time="120" @click="clearMessages">
            {{ clearing ? '清空中...' : '清空' }}
          </view>
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
import { getGoodsDetail } from '../../api/goods'
import { useAuthStore } from '../../store/auth'
import { formatDateTime, resolveThumbUrl } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

const FIVE_MINUTES = 5 * 60 * 1000
const GOODS_STATUS_TEXT = {
  PENDING: '待审核',
  ON_SALE: '在售',
  OFFLINE: '已下架',
  SOLD: '已售出'
}

export default {
  data() {
    return {
      id: '',
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      conversation: {},
      goodsDetail: {},
      messages: [],
      draft: '',
      sending: false,
      clearing: false,
      inputFocused: false,
      showClearConfirm: false,
      clearDialogReady: false,
      headerReady: false,
      summaryReady: false,
      composerReady: false,
      messagesReady: false,
      shouldMessageStagger: false,
      popMessageId: '',
      headerTimer: null,
      summaryTimer: null,
      composerTimer: null,
      messageEntryTimer: null,
      messageStaggerTimer: null,
      popTimer: null,
      dialogTimer: null
    }
  },
  computed: {
    trimmedDraft() {
      return (this.draft || '').trim()
    },
    canSend() {
      return Boolean(this.trimmedDraft)
    },
    roleText() {
      return this.conversation && this.conversation.myRole === 'BUYER' ? '联系商家中' : '回复买家中'
    },
    summaryImageUrl() {
      return resolveThumbUrl(this.conversation.goodsThumbUrl || this.conversation.goodsImageUrl || '')
    },
    timeHint() {
      return this.conversation && this.conversation.lastMessageAt
        ? formatDateTime(this.conversation.lastMessageAt)
        : '刚进入会话'
    },
    counterpartInitial() {
      const name = `${(this.conversation && this.conversation.counterpartName) || '聊'}`.trim()
      return name ? name.slice(0, 1) : '聊'
    },
    goodsPriceText() {
      const rawPrice = this.goodsDetail && (this.goodsDetail.price === 0 || this.goodsDetail.price ? this.goodsDetail.price : '')
      if (rawPrice === '' || rawPrice === null || typeof rawPrice === 'undefined') {
        return '价格待沟通'
      }
      const numeric = Number(rawPrice)
      if (Number.isNaN(numeric)) {
        return `¥${rawPrice}`
      }
      return `¥${numeric.toFixed(2)}`
    },
    goodsStatusText() {
      if (!this.goodsDetail) {
        return ''
      }
      if (this.goodsDetail.statusText) {
        return this.goodsDetail.statusText
      }
      return GOODS_STATUS_TEXT[this.goodsDetail.status] || ''
    },
    showGoodsStatus() {
      return Boolean(this.goodsStatusText && this.goodsStatusText !== '在售')
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
  onReady() {
    this.startEntryAnimation()
  },
  onShow() {
    syncThemePage(this)
  },
  onUnload() {
    this.clearTimers()
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
    startEntryAnimation() {
      clearTimeout(this.headerTimer)
      clearTimeout(this.summaryTimer)
      clearTimeout(this.composerTimer)
      this.headerReady = false
      this.summaryReady = false
      this.composerReady = false
      this.$nextTick(() => {
        this.headerTimer = setTimeout(() => {
          this.headerReady = true
          this.headerTimer = null
        }, 22)
        this.summaryTimer = setTimeout(() => {
          this.summaryReady = true
          this.summaryTimer = null
        }, 90)
        this.composerTimer = setTimeout(() => {
          this.composerReady = true
          this.composerTimer = null
        }, 180)
      })
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
            this.fetchGoodsDetail()
            return
          }
          uni.showToast({ title: (res && res.message) || '会话加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '会话加载失败', icon: 'none' })
        })
    },
    fetchGoodsDetail() {
      const goodsId = this.conversation && this.conversation.goodsId
      if (!goodsId) {
        this.goodsDetail = {}
        return
      }
      getGoodsDetail(goodsId)
        .then((res) => {
          if (res && res.code === 0) {
            this.goodsDetail = res.data || {}
            return
          }
          this.goodsDetail = {}
        })
        .catch(() => {
          this.goodsDetail = {}
        })
    },
    fetchMessages() {
      getConversationMessages(this.id, {
        pageNum: 1,
        pageSize: 100
      })
        .then((res) => {
          if (res && res.code === 0) {
            const records = (res.data && res.data.records) || []
            this.messages = records
              .slice()
              .sort((a, b) => this.toTimestamp(a.createdAt) - this.toTimestamp(b.createdAt))
            this.triggerMessageEntry(true)
            this.scrollToBottom(0)
            return
          }
          this.messages = []
          this.triggerMessageEntry(false)
        })
        .catch(() => {
          this.messages = []
          this.triggerMessageEntry(false)
        })
    },
    triggerMessageEntry(withStagger = false) {
      clearTimeout(this.messageEntryTimer)
      clearTimeout(this.messageStaggerTimer)
      this.messagesReady = false
      this.shouldMessageStagger = withStagger && this.messages.length > 0

      this.$nextTick(() => {
        this.messageEntryTimer = setTimeout(() => {
          this.messagesReady = true
          this.messageEntryTimer = null
          if (this.shouldMessageStagger) {
            this.messageStaggerTimer = setTimeout(() => {
              this.shouldMessageStagger = false
              this.messageStaggerTimer = null
            }, 820)
          }
        }, 24)
      })
    },
    messageStyle(index) {
      if (!this.shouldMessageStagger || !this.messagesReady) {
        return {}
      }
      return {
        transitionDelay: `${Math.min(index, 7) * 52}ms`
      }
    },
    toTimestamp(value) {
      if (!value) {
        return 0
      }
      const timestamp = new Date(value).getTime()
      return Number.isNaN(timestamp) ? 0 : timestamp
    },
    showTimeTag(index) {
      if (index === 0) {
        return true
      }
      const current = this.toTimestamp(this.messages[index] && this.messages[index].createdAt)
      const previous = this.toTimestamp(this.messages[index - 1] && this.messages[index - 1].createdAt)
      if (!current || !previous) {
        return false
      }
      return current - previous > FIVE_MINUTES
    },
    markPopMessage(id) {
      clearTimeout(this.popTimer)
      this.popMessageId = `${id || ''}`
      this.popTimer = setTimeout(() => {
        this.popMessageId = ''
        this.popTimer = null
      }, 420)
    },
    isPopMessage(item) {
      if (!item || typeof item.id === 'undefined' || item.id === null) {
        return false
      }
      return `${item.id}` === this.popMessageId
    },
    sendMessage() {
      if (!this.trimmedDraft || this.sending) {
        return
      }

      this.sending = true
      sendChatMessage(this.id, { content: this.trimmedDraft })
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            const newMessage = {
              ...res.data,
              isSelf: true
            }
            this.messages = [...this.messages, newMessage]
            this.draft = ''
            this.conversation = {
              ...this.conversation,
              lastMessage: newMessage.content,
              lastMessageAt: newMessage.createdAt
            }
            this.messagesReady = true
            this.shouldMessageStagger = false
            this.markPopMessage(newMessage.id)
            this.scrollToBottom(260)
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
    openClearDialog() {
      if (this.clearing) {
        return
      }
      this.showClearConfirm = true
      this.clearDialogReady = false
      clearTimeout(this.dialogTimer)
      this.$nextTick(() => {
        this.dialogTimer = setTimeout(() => {
          this.clearDialogReady = true
          this.dialogTimer = null
        }, 24)
      })
    },
    closeClearDialog() {
      this.clearDialogReady = false
      clearTimeout(this.dialogTimer)
      this.dialogTimer = setTimeout(() => {
        this.showClearConfirm = false
        this.dialogTimer = null
      }, 170)
    },
    clearMessages() {
      if (this.clearing) {
        return
      }
      this.clearing = true
      clearConversationMessages(this.id)
        .then((res) => {
          if (res && res.code === 0) {
            this.messages = []
            this.conversation = {
              ...this.conversation,
              lastMessage: '',
              lastMessageAt: ''
            }
            this.triggerMessageEntry(false)
            this.scrollToBottom(0)
            this.closeClearDialog()
            uni.showToast({ title: res.message || '聊天记录已清空', icon: 'none' })
            return
          }
          uni.showToast({ title: (res && res.message) || '清空失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '清空失败', icon: 'none' })
        })
        .finally(() => {
          this.clearing = false
        })
    },
    formatDate(value) {
      return formatDateTime(value)
    },
    scrollToBottom(duration = 0) {
      this.$nextTick(() => {
        setTimeout(() => {
          const options = this.messages.length
            ? { selector: '#chat-bottom-anchor', duration }
            : { scrollTop: 0, duration }
          uni.pageScrollTo(options)
        }, 36)
      })
    },
    onInputFocus() {
      this.inputFocused = true
      this.scrollToBottom(220)
    },
    onInputBlur() {
      this.inputFocused = false
    },
    goGoodsDetail() {
      const goodsId = this.conversation && this.conversation.goodsId
      if (!goodsId) {
        uni.showToast({ title: '暂无商品信息', icon: 'none' })
        return
      }
      uni.navigateTo({ url: `/pages/goods/detail?id=${goodsId}` })
    },
    goBack() {
      uni.reLaunch({ url: '/pages/chat/list' })
    },
    clearTimers() {
      clearTimeout(this.headerTimer)
      clearTimeout(this.summaryTimer)
      clearTimeout(this.composerTimer)
      clearTimeout(this.messageEntryTimer)
      clearTimeout(this.messageStaggerTimer)
      clearTimeout(this.popTimer)
      clearTimeout(this.dialogTimer)
      this.headerTimer = null
      this.summaryTimer = null
      this.composerTimer = null
      this.messageEntryTimer = null
      this.messageStaggerTimer = null
      this.popTimer = null
      this.dialogTimer = null
    }
  }
}
</script>

<style scoped>
.chat-detail-page {
  padding-bottom: 236rpx;
  background:
    radial-gradient(circle at 6% -8%, rgba(177, 61, 40, 0.16) 0, rgba(177, 61, 40, 0) 35%),
    radial-gradient(circle at 94% 4%, rgba(39, 35, 30, 0.12) 0, rgba(39, 35, 30, 0) 40%),
    var(--campus-page-bg);
}

.theme-dark.chat-detail-page {
  background:
    radial-gradient(circle at 5% -8%, rgba(177, 61, 40, 0.18) 0, rgba(177, 61, 40, 0) 36%),
    radial-gradient(circle at 96% 4%, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0) 42%),
    #211e1a;
}

.chat-bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(22rpx);
  pointer-events: none;
  z-index: 0;
}

.glow-top {
  width: 280rpx;
  height: 280rpx;
  top: 126rpx;
  right: -78rpx;
  background: rgba(225, 200, 170, 0.36);
}

.glow-bottom {
  width: 320rpx;
  height: 320rpx;
  left: -110rpx;
  bottom: 300rpx;
  background: rgba(170, 204, 188, 0.22);
}

.safe-top,
.goods-shell,
.messages-shell,
.composer-shell {
  position: relative;
  z-index: 1;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 10rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: opacity 360ms ease, transform 360ms cubic-bezier(0.2, 0.72, 0.22, 1);
}

.chat-header.header-ready {
  opacity: 1;
  transform: translateY(0);
}

.chat-back-btn {
  transition: transform 200ms ease;
}

.back-icon {
  font-size: 34rpx;
  color: #1e1a15;
}

.header-main {
  flex: 1;
  min-width: 0;
}

.header-name {
  font-size: 31rpx;
  line-height: 1.25;
  font-weight: 600;
  color: #191611;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-sub {
  margin-top: 4rpx;
  font-size: 21rpx;
  color: #857b6f;
}

.header-action {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(216, 209, 196, 0.88);
  box-shadow: var(--campus-shadow-soft);
  color: #8f8679;
  font-size: 30rpx;
}

.goods-shell {
  padding-top: 2rpx;
}

.goods-context-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx;
  border-radius: 24rpx;
  background: rgba(243, 239, 230, 0.94);
  border: 1rpx solid rgba(216, 209, 196, 0.88);
  box-shadow: 0 14rpx 30rpx rgba(45, 39, 31, 0.1);
  opacity: 0;
  transform: translateY(18rpx);
  transition:
    opacity 380ms ease,
    transform 380ms cubic-bezier(0.2, 0.72, 0.22, 1),
    box-shadow 220ms ease;
}

.goods-context-card.summary-ready {
  opacity: 1;
  transform: translateY(0);
}

.goods-context-card:active {
  box-shadow: 0 10rpx 20rpx rgba(45, 39, 31, 0.12);
}

.goods-thumb {
  width: 92rpx;
  height: 92rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  background: #f4f1ec;
}

.goods-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7d7265;
  font-size: 30rpx;
  font-weight: 700;
}

.goods-main {
  flex: 1;
  min-width: 0;
}

.goods-title {
  font-size: 26rpx;
  color: #201b15;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-meta {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.goods-price {
  flex-shrink: 0;
  font-size: 26rpx;
  color: #b13d28;
  font-weight: 700;
}

.goods-hint {
  min-width: 0;
  font-size: 21rpx;
  color: #8b8073;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goods-status {
  flex-shrink: 0;
  min-height: 42rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(216, 209, 196, 0.8);
  color: #7a7064;
  font-size: 20rpx;
}

.messages-shell {
  padding-top: 18rpx;
}

.empty-panel {
  border-radius: 24rpx;
  background: rgba(247, 243, 237, 0.94);
  border: 1rpx solid rgba(216, 209, 196, 0.88);
  padding: 80rpx 40rpx;
  text-align: center;
  opacity: 0;
  transform: translateY(16rpx);
  transition: opacity 340ms ease, transform 340ms cubic-bezier(0.2, 0.72, 0.22, 1);
}

.empty-panel.messages-ready {
  opacity: 1;
  transform: translateY(0);
}

.empty-title {
  font-size: 30rpx;
  color: #2b251f;
  margin-bottom: 12rpx;
  font-weight: 600;
}

.empty-desc {
  font-size: 24rpx;
  color: #8b8174;
  line-height: 1.8;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.message-block {
  opacity: 0;
  transform: translateY(18rpx) scale(0.988);
  transition: opacity 360ms ease, transform 360ms cubic-bezier(0.2, 0.72, 0.22, 1);
  will-change: transform, opacity;
}

.message-list.messages-ready .message-block {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.message-pop .message-bubble {
  animation: bubble-pop 320ms cubic-bezier(0.16, 0.8, 0.26, 1);
}

.time-row {
  display: flex;
  justify-content: center;
  margin-bottom: 12rpx;
}

.time-pill {
  min-height: 38rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(232, 227, 218, 0.86);
  border: 1rpx solid rgba(216, 209, 196, 0.72);
  color: #968c80;
  font-size: 20rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
}

.message-row.self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
  color: #6f665a;
  background: rgba(238, 232, 223, 0.95);
  border: 1rpx solid rgba(216, 209, 196, 0.8);
}

.message-bubble-wrap {
  max-width: 74%;
}

.message-bubble {
  padding: 18rpx 22rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid rgba(228, 223, 214, 0.92);
  box-shadow: 0 10rpx 24rpx rgba(28, 24, 19, 0.08);
  font-size: 26rpx;
  line-height: 1.7;
  color: #2b251f;
  word-break: break-all;
  white-space: pre-wrap;
}

.message-row.self .message-bubble {
  background: #27231e;
  border-color: #27231e;
  color: #fff8ec;
  border-bottom-right-radius: 10rpx;
}

.message-row:not(.self) .message-bubble {
  border-bottom-left-radius: 10rpx;
}

.bottom-anchor {
  height: 6rpx;
}

.composer-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(10rpx + env(safe-area-inset-bottom));
  z-index: 25;
  opacity: 0;
  transform: translateY(22rpx);
  transition: opacity 360ms ease, transform 360ms cubic-bezier(0.2, 0.72, 0.22, 1);
}

.composer-shell.composer-ready {
  opacity: 1;
  transform: translateY(0);
}

.composer-wrap {
  padding-bottom: 0;
}

.composer-card {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 14rpx;
  border-radius: 30rpx;
  background: rgba(247, 243, 237, 0.95);
  border: 1rpx solid rgba(216, 209, 196, 0.92);
  box-shadow: 0 16rpx 32rpx rgba(45, 39, 31, 0.14);
}

.composer-input-wrap {
  flex: 1;
  min-height: 84rpx;
  border-radius: 999rpx;
  background: #f1ece4;
  border: 1rpx solid rgba(216, 209, 196, 0.9);
  display: flex;
  align-items: center;
  padding: 0 26rpx;
  transition: border-color 220ms ease, box-shadow 220ms ease, background-color 220ms ease;
}

.composer-input-wrap.focused {
  border-color: rgba(88, 74, 58, 0.52);
  box-shadow: 0 0 0 4rpx rgba(39, 35, 30, 0.08);
  background: #f7f3ed;
}

.composer-input {
  width: 100%;
  height: 84rpx;
  font-size: 26rpx;
  color: #261f18;
}

.send-btn {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1rpx solid rgba(216, 209, 196, 0.9);
  background: #e1d9ce;
  color: #8e8478;
  line-height: 1;
  transition: transform 180ms ease, background-color 220ms ease, color 220ms ease, box-shadow 220ms ease;
}

.send-btn::after {
  border: none;
}

.send-btn .bi {
  font-size: 30rpx;
}

.send-btn.active {
  background: #27231e;
  border-color: #27231e;
  color: #fff8ec;
  box-shadow: 0 12rpx 24rpx rgba(39, 35, 30, 0.28);
  animation: send-glow 2.6s ease-in-out infinite;
}

.send-btn.sending .bi {
  animation: spin 880ms linear infinite;
}

.send-btn[disabled] {
  opacity: 1;
}

.send-btn-hover {
  transform: scale(0.93);
}

.confirm-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 56rpx;
  background: rgba(24, 20, 16, 0.3);
  opacity: 0;
  transition: opacity 180ms ease;
}

.confirm-mask.mask-ready {
  opacity: 1;
}

.confirm-card {
  width: 100%;
  border-radius: 26rpx;
  overflow: hidden;
  background: rgba(247, 243, 237, 0.98);
  border: 1rpx solid rgba(216, 209, 196, 0.95);
  box-shadow: 0 24rpx 46rpx rgba(34, 30, 24, 0.28);
  opacity: 0;
  transform: translateY(14rpx) scale(0.96);
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.2, 0.78, 0.26, 1);
}

.confirm-card.card-ready {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.confirm-head {
  padding: 34rpx 34rpx 30rpx;
}

.confirm-title {
  font-size: 31rpx;
  color: #1f1a15;
  font-weight: 600;
}

.confirm-text {
  margin-top: 14rpx;
  font-size: 24rpx;
  color: #7f7569;
  line-height: 1.75;
}

.confirm-actions {
  display: flex;
  align-items: stretch;
  border-top: 1rpx solid rgba(216, 209, 196, 0.86);
}

.confirm-btn {
  flex: 1;
  min-height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 27rpx;
}

.confirm-btn.cancel {
  color: #7f7569;
}

.confirm-btn.danger {
  color: #b13d28;
  font-weight: 600;
}

.confirm-divider {
  width: 1rpx;
  background: rgba(216, 209, 196, 0.86);
}

.press-in {
  transform: scale(0.93) !important;
}

.press-soft {
  transform: scale(0.988) !important;
}

@keyframes bubble-pop {
  0% {
    transform: scale(0.92);
    opacity: 0.74;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes send-glow {
  0%,
  100% {
    box-shadow: 0 12rpx 24rpx rgba(39, 35, 30, 0.26);
  }
  50% {
    box-shadow: 0 16rpx 30rpx rgba(39, 35, 30, 0.36);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 360px) {
  .header-name {
    font-size: 29rpx;
  }

  .goods-title {
    font-size: 24rpx;
  }

  .message-bubble-wrap {
    max-width: 78%;
  }
}
</style>
