<template>
  <view class="tabbar-shell market-card">
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tabbar-item"
      :class="{ active: active === item.key }"
      @click="go(item)"
    >
      <view class="tabbar-icon" :class="{ active: active === item.key }">{{ item.icon }}</view>
      <text class="tabbar-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    active: {
      type: String,
      default: 'home'
    }
  },
  data() {
    return {
      tabs: [
        { key: 'home', label: '首页', icon: '⌂', path: '/pages/index/index' },
        { key: 'publish', label: '发布', icon: '+', path: '/pages/goods/publish' },
        { key: 'orders', label: '订单', icon: '▦', path: '/pages/order/list' },
        { key: 'profile', label: '我的', icon: '◉', path: '/pages/user/profile' }
      ]
    }
  },
  methods: {
    go(item) {
      if (this.active === item.key) {
        return
      }
      uni.reLaunch({ url: item.path })
    }
  }
}
</script>

<style scoped>
.tabbar-shell {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(20rpx + env(safe-area-inset-bottom));
  z-index: 30;
  height: 120rpx;
  padding: 10rpx 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.tabbar-item {
  flex: 1;
  height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  color: #6c757d;
}

.tabbar-item.active {
  color: #2d6a4f;
}

.tabbar-icon {
  width: 54rpx;
  height: 54rpx;
  border-radius: 18rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 700;
}

.tabbar-icon.active {
  background: #e8f5e9;
  color: #2d6a4f;
}

.tabbar-label {
  font-size: 22rpx;
  font-weight: 600;
}
</style>
