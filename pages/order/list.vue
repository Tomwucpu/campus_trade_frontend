<template>
  <view class="market-page order-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="page-title">我的订单</view>

      <scroll-view scroll-x class="tab-scroll" show-scrollbar="false">
        <view class="tab-row">
          <view
            v-for="item in statusOptions"
            :key="item.value"
            class="tab-item"
            :class="{ active: status === item.value }"
            @click="setStatus(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="market-shell order-shell">
      <EmptyState
        v-if="!displayList.length"
        icon="📦"
        title="暂无订单"
        description="去首页看看有没有感兴趣的闲置，或者继续发布你的商品。"
        button-text="去逛逛"
        @action="goMarket"
      />

      <view v-else class="order-list">
        <view
          v-for="item in displayList"
          :key="item.id"
          class="market-card order-card"
          @click="openOrder(item)"
        >
          <view class="order-head">
            <text class="order-time">{{ item.createdAtText }}</text>
            <StatusTag :status="item.statusText" :type="item.statusType" />
          </view>

          <view class="order-body">
            <image class="order-image" :src="item.imageUrl" mode="aspectFill"></image>
            <view class="order-main">
              <view class="order-title">{{ item.goodsTitle }}</view>
              <view class="order-meta">{{ item.roleType === 'SELLER' ? '买家' : '卖家' }}：{{ item.counterpartName }}</view>
              <view class="order-price market-price">¥{{ item.totalAmountText }}</view>
            </view>
          </view>

          <view class="order-actions">
            <button class="market-secondary-btn action-btn" @click.stop="handleSecondaryAction(item)">
              {{ secondaryActionLabel(item) }}
            </button>
            <button class="market-primary-btn action-btn" @click.stop="handlePrimaryAction(item)">
              {{ primaryActionLabel(item) }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <AppTabBar active="orders" />
  </view>
</template>

<script>
import { cancelOrder, completeOrder, getOrderList, payOrder, shipOrder } from '../../api/order'
import AppTabBar from '../../components/AppTabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import StatusTag from '../../components/StatusTag.vue'
import { useAuthStore } from '../../store/auth'
import { useOrderStore } from '../../store/order'
import { normalizeOrderItem, pushLocalMessage } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    AppTabBar,
    EmptyState,
    StatusTag
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      list: [],
      status: 'all',
      authStore: useAuthStore(),
      orderStore: useOrderStore(),
      statusOptions: [
        { value: 'all', label: '全部' },
        { value: 'PENDING_PAYMENT', label: '待付款' },
        { value: 'PAID', label: '待发货' },
        { value: 'SHIPPED', label: '待收货' },
        { value: 'COMPLETED', label: '已完成' },
        { value: 'CANCELLED', label: '已取消' }
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
    if (!this.ensureLogin()) {
      return
    }
    this.syncPageState()
    this.fetchList()
  },
  onShow() {
    if (!this.ensureLogin()) {
      return
    }
    this.syncPageState()
    this.fetchList()
  },
  methods: {
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      uni.showToast({ title: '请先登录后查看订单', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    syncPageState() {
      syncThemePage(this)
      const store = this.orderStore.sync()
      this.status = store.status || 'all'
    },
    setStatus(value) {
      this.status = value
      this.orderStore.setStatus(value)
      this.fetchList()
    },
    fetchList() {
      getOrderList({
        pageNum: 1,
        pageSize: 30,
        status: this.status === 'all' ? undefined : this.status
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.list = (res.data && res.data.records) || []
            return
          }
          this.list = []
        })
        .catch(() => {
          this.list = []
        })
    },
    primaryActionLabel(item) {
      if (item.roleType === 'BUYER' && item.status === 'PENDING_PAYMENT') {
        return '立即支付'
      }
      if (item.roleType === 'SELLER' && item.status === 'PAID') {
        return '确认发货'
      }
      if (item.roleType === 'BUYER' && item.status === 'SHIPPED') {
        return '确认收货'
      }
      return '查看详情'
    },
    secondaryActionLabel(item) {
      if (item.roleType === 'BUYER' && item.status === 'PENDING_PAYMENT') {
        return '取消订单'
      }
      return '联系对方'
    },
    handlePrimaryAction(item) {
      if (item.roleType === 'BUYER' && item.status === 'PENDING_PAYMENT') {
        this.runAction(() => payOrder(item.id), item, '订单已支付')
        return
      }
      if (item.roleType === 'SELLER' && item.status === 'PAID') {
        this.runAction(() => shipOrder(item.id), item, '订单已发货')
        return
      }
      if (item.roleType === 'BUYER' && item.status === 'SHIPPED') {
        this.runAction(() => completeOrder(item.id), item, '交易已完成')
        return
      }
      this.openOrder(item)
    },
    handleSecondaryAction(item) {
      if (item.roleType === 'BUYER' && item.status === 'PENDING_PAYMENT') {
        this.runAction(() => cancelOrder(item.id), item, '订单已取消')
        return
      }
      uni.showToast({ title: `请与${item.counterpartName}继续沟通`, icon: 'none' })
    },
    runAction(action, item, title) {
      action()
        .then((res) => {
          if (res && res.code === 0) {
            const nextOrder = normalizeOrderItem(res.data || item, 0)
            this.orderStore.setCurrentOrder(nextOrder)
            pushLocalMessage({
              type: 'order',
              title,
              content: `订单 ${nextOrder.orderNo} 当前状态为“${nextOrder.statusText}”。`
            })
            uni.showToast({ title: res.message || '操作成功', icon: 'success' })
            this.fetchList()
            return
          }
          uni.showToast({ title: (res && res.message) || '操作失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '操作失败', icon: 'none' })
        })
    },
    openOrder(item) {
      this.orderStore.setCurrentOrder(item)
      uni.navigateTo({ url: `/pages/order/detail?id=${item.id}` })
    },
    goMarket() {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
}
</script>

<style scoped>
.order-page {
  padding-bottom: 180rpx;
}

.page-title {
  font-size: 42rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 22rpx;
}

.tab-scroll {
  width: 100%;
  white-space: nowrap;
  padding-bottom: 12rpx;
}

.tab-row {
  display: inline-flex;
  gap: 14rpx;
  padding-right: 24rpx;
}

.tab-item {
  min-height: 60rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f8f9fa;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
}

.tab-item.active {
  background: #2d6a4f;
  color: #ffffff;
}

.order-shell {
  padding-top: 24rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.order-card {
  padding: 22rpx;
}

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.order-time {
  font-size: 22rpx;
  color: #6c757d;
}

.order-body {
  display: flex;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.order-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  flex-shrink: 0;
}

.order-main {
  flex: 1;
  min-width: 0;
}

.order-title {
  font-size: 28rpx;
  line-height: 1.5;
  color: #2c3e50;
  margin-bottom: 12rpx;
}

.order-meta {
  font-size: 22rpx;
  color: #6c757d;
  margin-bottom: 18rpx;
}

.order-price {
  font-size: 34rpx;
}

.order-actions {
  display: flex;
  gap: 14rpx;
}

.action-btn {
  flex: 1;
}
</style>
