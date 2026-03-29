<template>
  <view class="market-empty empty-state" :class="stateClasses">
    <view class="empty-icon">
      <text class="empty-icon-symbol" :class="resolvedIconClass"></text>
    </view>
    <view class="empty-title">{{ title }}</view>
    <view class="empty-desc">{{ description }}</view>
    <button v-if="buttonText" class="market-primary-btn empty-btn" @click="$emit('action')">{{ buttonText }}</button>
  </view>
</template>

<script>
const DEFAULT_ICON_CLASS = 'bi bi-inbox'

const LEGACY_ICON_MAP = {
  '📦': 'bi bi-box',
  '🗂': 'bi bi-folder2-open',
  '🔎': 'bi bi-search',
  '♥': 'bi bi-heart',
  货: 'bi bi-box-seam',
  聊: 'bi bi-chat-left-text',
  铃: 'bi bi-bell'
}

export default {
  emits: ['action'],
  props: {
    icon: {
      type: String,
      default: DEFAULT_ICON_CLASS
    },
    title: {
      type: String,
      default: '暂无内容'
    },
    description: {
      type: String,
      default: '稍后再来看看吧'
    },
    buttonText: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    stateClasses() {
      return {
        'empty-state--home': this.variant === 'home',
        'empty-state--list': this.variant === 'list'
      }
    },
    resolvedIconClass() {
      const value = String(this.icon || '').trim()
      if (!value) {
        return DEFAULT_ICON_CLASS
      }

      if (value.includes('bi-')) {
        return value.includes('bi ') ? value : `bi ${value}`
      }

      return LEGACY_ICON_MAP[value] || DEFAULT_ICON_CLASS
    }
  }
}
</script>

<style scoped>
.empty-state {
  padding: 88rpx 32rpx 72rpx;
  text-align: center;
}

.empty-state--home {
  padding: 80rpx 24rpx 64rpx;
}

.empty-state--list {
  background: rgba(255, 255, 255, 0.88);
  border: 1rpx solid rgba(233, 236, 239, 0.92);
  border-radius: 28rpx;
  box-shadow: 0 14rpx 28rpx rgba(25, 53, 79, 0.05);
}

.empty-icon {
  width: 116rpx;
  height: 116rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(233, 236, 239, 0.92);
  background: linear-gradient(180deg, #f8f9fa 0%, #f1f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-symbol {
  display: inline-flex;
  line-height: 1;
  font-size: 48rpx;
  color: #8a96a3;
}

.empty-title {
  font-size: 31rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12rpx;
}

.empty-desc {
  max-width: 520rpx;
  margin: 0 auto;
  font-size: 24rpx;
  line-height: 1.75;
  color: #6c757d;
}

.empty-btn {
  min-width: 220rpx;
  margin-top: 30rpx;
}
</style>
