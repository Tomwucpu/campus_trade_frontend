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
export default {
  emits: ['action'],
  props: {
    icon: {
      type: String,
      default: 'bi bi-inbox'
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
        'market-card': this.variant === 'list',
        'empty-state--home': this.variant === 'home',
        'empty-state--list': this.variant === 'list'
      }
    },
    resolvedIconClass() {
      const value = String(this.icon || '').trim()
      if (!value) {
        return 'bi bi-inbox'
      }
      if (value.startsWith('bi bi-')) {
        return value
      }
      if (value.startsWith('bi-')) {
        return `bi ${value}`
      }
      if (value.startsWith('bi ')) {
        return value
      }
      return `bi bi-${value}`
    }
  }
}
</script>

<style scoped>
.empty-state {
  padding: 84rpx 32rpx 70rpx;
  text-align: center;
}

.empty-state--home {
  padding: 76rpx 24rpx 62rpx;
}

.empty-state--list {
  border-radius: var(--campus-radius-xl);
  box-shadow: var(--campus-shadow-soft);
}

.empty-icon {
  width: 116rpx;
  height: 116rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(216, 209, 196, 0.9);
  background: rgba(243, 239, 230, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-symbol {
  display: inline-flex;
  line-height: 1;
  font-size: 48rpx;
  color: var(--campus-text-muted);
}

.empty-title {
  font-size: 31rpx;
  font-weight: 700;
  color: var(--campus-text);
  margin-bottom: 12rpx;
}

.empty-desc {
  max-width: 520rpx;
  margin: 0 auto;
  font-size: 24rpx;
  line-height: 1.75;
  color: var(--campus-text-muted);
}

.empty-btn {
  min-width: 220rpx;
  margin-top: 30rpx;
}
</style>
