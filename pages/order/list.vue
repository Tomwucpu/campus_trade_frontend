<template>
  <view class="app-page" :class="themeClass">
    <view class="top app-card">
      <view>
        <view class="top-title">我的订单</view>
        <view class="top-sub">记录每一笔校园交易状态</view>
      </view>
      <button class="app-secondary-btn refresh-btn" size="mini" @click="fetchList">刷新</button>
    </view>

    <view v-if="!list.length" class="app-empty app-card">暂无订单记录</view>

    <view v-for="item in list" :key="item.id" class="order-item app-card">
      <view class="row">
        <view class="label">订单号</view>
        <view class="value">{{ item.orderNo }}</view>
      </view>
      <view class="row">
        <view class="label">状态</view>
        <view class="status-tag">{{ item.status }}</view>
      </view>
      <view class="row">
        <view class="label">金额</view>
        <view class="amount app-price">￥{{ item.totalAmount }}</view>
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
.top {
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14rpx;
  margin-bottom: 14rpx;
}

.top-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink-text);
}

.top-sub {
  margin-top: 8rpx;
  color: var(--ink-subtext);
  font-size: 23rpx;
}

.refresh-btn {
  min-width: 124rpx;
  margin-top: 8rpx;
}

.order-item {
  padding: 18rpx 20rpx;
  margin-bottom: 12rpx;
}

.row {
  min-height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.label {
  font-size: 24rpx;
  color: var(--ink-subtext);
}

.value {
  max-width: 70%;
  text-align: right;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--ink-text);
}

.status-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 18rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-text);
}

.amount {
  font-size: 30rpx;
}
</style>
