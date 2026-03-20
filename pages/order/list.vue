<template>
  <view class="app-page order-page" :class="themeClass">
    <view class="order-header app-card">
      <view class="order-head-top">
        <view>
          <view class="order-kicker">Order Chronicle</view>
          <view class="order-title">交易记录</view>
        </view>
        <view class="refresh-chip" @click="fetchList">刷新</view>
      </view>

      <view class="status-row">
        <view
          v-for="item in statusOptions"
          :key="item.value"
          class="status-chip"
          :class="{ active: status === item.value }"
          @click="setStatus(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <view v-if="!displayList.length" class="app-empty app-card">
      目前没有符合条件的订单记录，去首页逛逛新的闲置也不错。
    </view>

    <view v-else class="order-list">
      <view
        v-for="item in displayList"
        :key="item.id"
        class="order-card app-card"
        :class="{ focus: String(item.id) === String(currentOrderId) }"
      >
        <view class="order-card-top">
          <view>
            <view class="order-no">{{ item.orderNo }}</view>
            <view class="order-goods">{{ item.goodsTitle }}</view>
          </view>
          <view class="status-pill" :class="item.statusTone">{{ item.statusText }}</view>
        </view>

        <view class="order-summary">{{ item.summary }}</view>

        <view class="order-card-bottom">
          <view>
            <view class="order-seller">卖家：{{ item.sellerName }}</view>
            <view class="order-price app-price">¥{{ item.totalAmountText }}</view>
          </view>
          <view class="order-actions">
            <view class="action-ghost" @click="goGoodsList">继续逛</view>
            <view class="action-solid" @click="contactSeller">联系卖家</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderList } from '../../api/order'
import { useOrderStore } from '../../store/order'
import { normalizeOrderItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  data() {
    return {
      theme: 'light',
      themeClass: '',
      list: [],
      status: 'all',
      currentOrderId: null,
      orderStore: useOrderStore(),
      statusOptions: [
        { value: 'all', label: '全部' },
        { value: 'PENDING_PAYMENT', label: '待付款' },
        { value: 'PENDING_RECEIPT', label: '待收货' },
        { value: 'COMPLETED', label: '已完成' }
      ]
    }
  },
  computed: {
    displayList() {
      const orders = this.list.map((item, index) => normalizeOrderItem(item, index))
      if (this.status === 'all') {
        return orders
      }
      return orders.filter((item) => item.status === this.status)
    }
  },
  onLoad() {
    this.syncPageState()
    this.fetchList()
  },
  onShow() {
    this.syncPageState()
  },
  methods: {
    syncPageState() {
      syncThemePage(this)
      const store = this.orderStore.sync()
      this.status = store.status || 'all'
      this.currentOrderId = store.currentOrderId
    },
    setStatus(value) {
      this.status = value
      this.orderStore.setStatus(value)
    },
    fetchList() {
      getOrderList({ pageNum: 1, pageSize: 20 })
        .then((res) => {
          if (res && res.code === 0) {
            this.list = (res.data && res.data.records) || []
            return
          }
          uni.showToast({ title: (res && res.message) || '订单加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '订单加载失败', icon: 'none' })
        })
    },
    goGoodsList() {
      uni.navigateTo({ url: '/pages/goods/list' })
    },
    contactSeller() {
      uni.showToast({ title: '当前为演示流程，可线下面交沟通', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.order-page {
  padding-bottom: 40rpx;
}

.order-header {
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.order-head-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.order-kicker {
  font-size: 20rpx;
  letter-spacing: 5rpx;
  text-transform: uppercase;
  color: var(--ink-subtext);
  margin-bottom: 8rpx;
}

.order-title {
  font-family: var(--ink-font-title);
  font-size: 52rpx;
  color: var(--ink-text);
}

.refresh-chip {
  padding: 16rpx 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--ink-border-strong);
  font-size: 23rpx;
  color: var(--ink-text);
}

.status-row {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.status-chip {
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--ink-border);
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  font-size: 22rpx;
}

.status-chip.active {
  background: var(--ink-accent);
  border-color: var(--ink-accent);
  color: var(--ink-tag-active-text);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.order-card {
  padding: 26rpx;
}

.order-card.focus {
  border-color: var(--ink-border-strong);
  box-shadow: 0 24rpx 60rpx rgba(110, 88, 34, 0.12);
}

.theme-dark .order-card.focus {
  box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.24);
}

.order-card-top {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.order-no {
  font-size: 22rpx;
  color: var(--ink-subtext);
  margin-bottom: 10rpx;
}

.order-goods {
  font-size: 32rpx;
  line-height: 1.45;
  color: var(--ink-text);
}

.status-pill {
  align-self: flex-start;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.status-pill.pending {
  background: rgba(201, 154, 68, 0.14);
  color: #a16a12;
}

.status-pill.active {
  background: rgba(54, 102, 168, 0.14);
  color: #365b96;
}

.status-pill.done {
  background: rgba(51, 120, 86, 0.14);
  color: #2f6d50;
}

.status-pill.muted {
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
}

.order-summary {
  font-size: 23rpx;
  line-height: 1.8;
  color: var(--ink-subtext);
  margin-bottom: 20rpx;
}

.order-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20rpx;
}

.order-seller {
  font-size: 22rpx;
  color: var(--ink-subtext);
  margin-bottom: 8rpx;
}

.order-price {
  font-size: 40rpx;
}

.order-actions {
  display: flex;
  gap: 12rpx;
}

.action-ghost,
.action-solid {
  min-width: 110rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23rpx;
}

.action-ghost {
  border: 1rpx solid var(--ink-border);
  color: var(--ink-text);
}

.action-solid {
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
}
</style>
