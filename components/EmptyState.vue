<template>
  <view class="market-empty empty-state" :class="stateClasses">
    <view class="empty-icon">{{ icon }}</view>
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
      default: '📦'
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
        'empty-state--home': this.variant === 'home'
      }
    }
  }
}
</script>

<style scoped>
.empty-state {
  padding: 100rpx 32rpx 80rpx;
}

.empty-state--home {
  padding: 86rpx 28rpx 68rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 54rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 24rpx;
  line-height: 1.7;
  color: #6c757d;
}

.empty-btn {
  min-width: 220rpx;
  margin-top: 28rpx;
}
</style>
