<template>
  <view class="app-page" :class="themeClass">
    <view class="app-page-header">
       <view class="big-title">交易记录</view>
       <button class="app-secondary-btn sm" @click="fetchList">刷新</button>
    </view>

    <view v-if="!list.length" class="app-empty">暂无相关订单</view>

    <view v-for="item in list" :key="item.id" class="order-card app-card">
      <view class="card-head border-bottom">
        <view class="shop-info">
          <text class="shop-icon">🛒</text>
          <text class="shop-name">商品订单</text>
        </view>
        <view class="order-status">{{ item.status }}</view>
      </view>
      
      <view class="card-body">
        <view class="goods-thumb"></view>
        <view class="goods-info">
          <view class="g-title">订单编号: {{ item.orderNo }}</view>
          <view class="g-desc">本订单的所有权归属当前登录用户，请确保在校园内进行安全交易。</view>
        </view>
      </view>

      <view class="card-foot">
        <view class="total-price">
          <text class="label">实付款</text>
          <text class="app-price">￥{{ item.totalAmount }}</text>
        </view>
        <view class="actions">
          <button class="act-btn">联系卖家</button>
          <button class="act-btn primary">确认收货</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderList } from '../../api/order'
import { getTheme, resolveThemeClass, applyNavigationTheme } from '../../utils/theme'

export default {
  data() {
    return {
      list: [],
      themeClass: resolveThemeClass(getTheme())
    }
  },
  onShow() {
    this.syncTheme()
  },
  onLoad() {
    this.fetchList()
  },
  methods: {
    syncTheme() {
      const theme = getTheme()
      this.themeClass = resolveThemeClass(theme)
      applyNavigationTheme(theme)
    },
    fetchList() {
      getOrderList({ pageNum: 1, pageSize: 10 }).then((res) => {
        if (res && res.code === 0) {
          this.list = (res.data && res.data.records) || []
          return
        }
        uni.showToast({ title: (res && res.message) || '加载失败', icon: 'none' })
      }).catch(() => {
        uni.showToast({ title: '加载失败', icon: 'none' })
      })
    }
  }
}
</script>

<style scoped>
.app-page-header {
  padding: 20rpx 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.big-title {
  font-size: 34rpx;
  font-weight: 800;
  color: var(--ink-text);
}

.sm {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  min-width: auto;
}

.order-card {
  margin-bottom: 20rpx;
  padding: 0;
  overflow: hidden;
}

.card-head {
  padding: 20rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.border-bottom {
  border-bottom: 1rpx solid var(--ink-border);
}

.shop-info {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 26rpx;
  color: var(--ink-text);
}

.shop-icon {
  margin-right: 10rpx;
  font-size: 30rpx;
}

.order-status {
  font-size: 26rpx;
  color: var(--ink-accent);
}

.card-body {
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
}

.goods-thumb {
  width: 120rpx;
  height: 120rpx;
  background: var(--ink-surface-alt);
  border-radius: 8rpx;
}

.goods-info {
  flex: 1;
}

.g-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink-text);
  margin-bottom: 8rpx;
}

.g-desc {
  font-size: 22rpx;
  color: var(--ink-subtext);
  line-height: 1.4;
}

.card-foot {
  padding: 20rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--ink-bg); /* slightly different if needed, else inherit */
}

.total-price .label {
  font-size: 24rpx;
  color: var(--ink-subtext);
  margin-right: 8rpx;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.act-btn {
  margin: 0;
  background: transparent;
  border: 1rpx solid var(--ink-border);
  color: var(--ink-text);
  font-size: 24rpx;
  border-radius: 28rpx;
  padding: 0 24rpx;
  height: 52rpx;
  line-height: 50rpx;
}

.act-btn.primary {
  border-color: var(--ink-text);
  color: var(--ink-text);
  font-weight: 600;
}
</style>
