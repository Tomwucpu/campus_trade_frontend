<template>
  <view class="market-page order-page" :class="themeClass">
    <view class="order-header safe-top">
      <view class="market-shell header-shell">
        <view class="header-bar">
          <view class="header-back" @click="goBack">
            <text class="bi bi-arrow-left icon-font"></text>
          </view>
          <view class="header-title">我的订单</view>
          <view class="header-placeholder"></view>
        </view>
      </view>

      <scroll-view scroll-x class="status-tabs" show-scrollbar="false">
        <view class="status-row">
          <view class="status-slider" :style="statusSliderStyle"></view>
          <view
            v-for="item in statusOptions"
            :key="item.value"
            class="status-tab"
            :class="{ active: status === item.value }"
            @click="setStatus(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="market-shell order-shell" :class="[{ switching: statusSwitching }, `switch-to-${slideFrom}`]">
      <EmptyState
        v-if="hasFetchedCurrentStatus && !displayList.length"
        class="list-empty-state"
        :class="`slide-from-${slideFrom}`"
        variant="list"
        icon="bi bi-receipt"
        title="暂无订单"
        description="去首页看看有没有感兴趣的闲置，或者继续发布你的商品。"
        button-text="去逛逛"
        @action="goMarket"
      />

      <view v-else-if="displayList.length" class="order-list" :class="`slide-from-${slideFrom}`" :key="`order-list-${status}-${listRenderSeed}`">
        <view
          v-for="(item, index) in displayList"
          :key="item.id"
          class="order-card"
          :style="{ '--order-enter-delay': `${Math.min(index, 8) * 42}ms` }"
          @click="openOrder(item)"
        >
          <view class="order-card-head">
            <view class="head-meta">
              <text class="role-text">{{ roleText(item) }}</text>
              <text class="head-dot">·</text>
              <text class="time-text">{{ item.createdAtRelative || item.createdAtText }}</text>
            </view>
            <view class="status-chip" :class="statusChipClass(item)">
              {{ item.statusText }}
            </view>
          </view>

          <view class="order-divider"></view>

          <view class="order-card-body" :class="{ 'without-image': !item.imageUrl, 'without-side': !counterpartLabel(item) }">
            <image v-if="item.imageUrl" class="order-image" :src="item.imageUrl" mode="aspectFill"></image>

            <view class="goods-main">
              <view class="goods-title">{{ item.goodsTitle }}</view>
              <view class="goods-price">¥{{ item.totalAmountText }}</view>
            </view>

            <view v-if="counterpartLabel(item)" class="goods-side">
              <view class="counterpart-text">{{ counterpartLabel(item) }}</view>
            </view>
          </view>

          <view class="order-card-actions">
            <button class="action-btn action-ghost" @click.stop="openOrderConversation(item)">
              <text class="bi bi-chat icon-font action-icon"></text>
              <text>{{ contactActionLabel(item) }}</text>
            </button>

            <button v-if="canDelete(item)" class="action-btn action-outline" @click.stop="confirmDelete(item)">
              删除订单
            </button>

            <button v-if="showPrimaryAction(item)" class="action-btn action-primary" @click.stop="handlePrimaryAction(item)">
              {{ primaryActionLabel(item) }}
            </button>
          </view>
        </view>
      </view>

      <view v-else class="list-loading" :class="`slide-from-${slideFrom}`">
        <text class="bi bi-arrow-repeat icon-font loading-icon"></text>
        <text class="loading-text">订单加载中...</text>
      </view>
    </view>

    <AppTabBar active="orders" />
  </view>
</template>

<script>
import { openConversationByOrder } from '../../api/chat'
import { completeOrder, deleteOrder, getOrderList, payOrder, shipOrder } from '../../api/order'
import AppTabBar from '../../components/AppTabBar.vue'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../store/auth'
import { useOrderStore } from '../../store/order'
import { normalizeOrderItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    AppTabBar,
    EmptyState
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      list: [],
      status: 'all',
      slideFrom: 'right',
      statusSwitching: false,
      hasFetchedCurrentStatus: false,
      listRenderSeed: 0,
      activeRequestId: 0,
      switchFallbackTimer: null,
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
    },
    activeStatusIndex() {
      const index = this.statusOptions.findIndex((item) => item.value === this.status)
      return index >= 0 ? index : 0
    },
    statusSliderStyle() {
      const count = this.statusOptions.length || 1
      const widthPercent = 100 / count
      const leftPercent = (this.activeStatusIndex * 100) / count
      return {
        width: `calc(${widthPercent}% - 36rpx)`,
        left: `calc(${leftPercent}% + 18rpx)`
      }
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
  onUnload() {
    if (this.switchFallbackTimer) {
      clearTimeout(this.switchFallbackTimer)
      this.switchFallbackTimer = null
    }
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
      if (this.status === value) {
        return
      }
      const prevIndex = this.statusOptions.findIndex((item) => item.value === this.status)
      const nextIndex = this.statusOptions.findIndex((item) => item.value === value)
      this.slideFrom = nextIndex < prevIndex ? 'left' : 'right'
      this.statusSwitching = true
      this.status = value
      this.orderStore.setStatus(value)
      this.fetchList()
    },
    fetchList() {
      const requestId = ++this.activeRequestId
      this.hasFetchedCurrentStatus = false
      getOrderList({
        pageNum: 1,
        pageSize: 30,
        status: this.status === 'all' ? undefined : this.status
      })
        .then((res) => {
          if (requestId !== this.activeRequestId) {
            return
          }
          if (res && res.code === 0) {
            this.list = (res.data && res.data.records) || []
            this.listRenderSeed += 1
            this.hasFetchedCurrentStatus = true
            return
          }
          this.list = []
          this.listRenderSeed += 1
          this.hasFetchedCurrentStatus = true
        })
        .catch(() => {
          if (requestId !== this.activeRequestId) {
            return
          }
          this.list = []
          this.listRenderSeed += 1
          this.hasFetchedCurrentStatus = true
        })
        .finally(() => {
          if (requestId !== this.activeRequestId) {
            return
          }
          if (this.switchFallbackTimer) {
            clearTimeout(this.switchFallbackTimer)
          }
          this.switchFallbackTimer = setTimeout(() => {
            this.statusSwitching = false
          }, 120)
        })
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/user/profile' })
        }
      })
    },
    roleText(item) {
      return item && item.roleType === 'SELLER' ? '我卖的' : '我买的'
    },
    statusChipClass(item) {
      if (!item || !item.status) {
        return ''
      }
      if (item.status === 'PENDING_PAYMENT') {
        return 'pending'
      }
      if (item.status === 'PAID') {
        return 'paid'
      }
      if (item.status === 'SHIPPED') {
        return 'shipped'
      }
      if (item.status === 'COMPLETED') {
        return 'completed'
      }
      if (item.status === 'CANCELLED') {
        return 'cancelled'
      }
      return ''
    },
    showPrimaryAction(item) {
      return !this.canDelete(item)
    },
    primaryActionLabel(item) {
      if (item.roleType === 'BUYER' && item.status === 'PENDING_PAYMENT') {
        return '去支付'
      }
      if (item.roleType === 'SELLER' && item.status === 'PAID') {
        return '确认发货'
      }
      if (item.roleType === 'BUYER' && item.status === 'SHIPPED') {
        return '确认收货'
      }
      return '查看详情'
    },
    contactActionLabel(item) {
      return item.roleType === 'SELLER' ? '联系买家' : '联系卖家'
    },
    counterpartLabel(item) {
      const role = item && item.roleType === 'SELLER' ? '买家' : '卖家'
      return item && item.counterpartName ? `${role}：${item.counterpartName}` : ''
    },
    canDelete(item) {
      return ['COMPLETED', 'CANCELLED'].includes(item.status)
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
    openOrderConversation(item) {
      if (!item || !item.id) {
        uni.showToast({ title: '缺少订单信息', icon: 'none' })
        return
      }

      openConversationByOrder(item.id)
        .then((res) => {
          if (res && res.code === 0 && res.data && res.data.id) {
            uni.navigateTo({ url: `/pages/chat/detail?id=${res.data.id}` })
            return
          }
          uni.showToast({ title: (res && res.message) || '暂时无法进入聊天', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '暂时无法进入聊天', icon: 'none' })
        })
    },
    confirmDelete(item) {
      uni.showModal({
        title: '删除订单',
        content: '删除后该订单会从你的列表中移除，确认继续吗？',
        success: ({ confirm }) => {
          if (!confirm) {
            return
          }
          deleteOrder(item.id)
            .then((res) => {
              if (res && res.code === 0) {
                uni.showToast({ title: res.message || '订单已删除', icon: 'success' })
                this.fetchList()
                return
              }
              uni.showToast({ title: (res && res.message) || '删除失败', icon: 'none' })
            })
            .catch(() => {
              uni.showToast({ title: '删除失败', icon: 'none' })
            })
        }
      })
    },
    runAction(action, item, successTitle = '操作成功') {
      action()
        .then((res) => {
          if (res && res.code === 0) {
            const nextOrder = normalizeOrderItem(res.data || item, 0)
            this.orderStore.setCurrentOrder(nextOrder)
            uni.showToast({ title: res.message || successTitle, icon: 'success' })
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
  min-height: 100vh;
  padding-bottom: 190rpx;
  background: var(--campus-page-bg);
}

.icon-font {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.order-header {
  position: sticky;
  top: 0;
  z-index: 24;
  background: rgba(248, 247, 243, 0.96);
  backdrop-filter: blur(8px);
  border-bottom: 1rpx solid #e0e2e5;
}

.header-shell {
  padding-bottom: 8rpx;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 88rpx;
}

.header-back,
.header-placeholder {
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
}

.header-back {
  border-radius: 50%;
  color: #2a251f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-back .icon-font {
  font-size: 36rpx;
}

.header-title {
  font-size: 38rpx;
  font-weight: 600;
  color: #221e18;
  letter-spacing: 1rpx;
}

.status-tabs {
  width: 100%;
  white-space: nowrap;
}

.status-row {
  position: relative;
  display: flex;
  min-width: 100%;
  padding: 0 12rpx;
}

.status-slider {
  position: absolute;
  bottom: 0;
  height: 4rpx;
  border-radius: 999rpx;
  background: #1f1a15;
  left: 18rpx;
  transition: left 0.24s cubic-bezier(0.2, 0.7, 0.24, 1);
  will-change: left;
  pointer-events: none;
}

.status-tab {
  position: relative;
  min-height: 80rpx;
  flex: 1;
  min-width: 0;
  padding: 0 8rpx;
  color: #918978;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.22s ease;
  z-index: 1;
}

.status-tab.active {
  color: #2f2922;
  font-weight: 600;
}

.order-shell {
  padding-top: 22rpx;
  overflow: hidden;
  transition: transform 0.2s ease;
  will-change: transform;
}

.order-shell.switching.switch-to-right {
  transform: translateX(-28rpx);
}

.order-shell.switching.switch-to-left {
  transform: translateX(28rpx);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  will-change: transform;
}

.order-list.slide-from-right {
  animation: listSlideFromRight 0.3s cubic-bezier(0.2, 0.7, 0.24, 1) both;
}

.order-list.slide-from-left {
  animation: listSlideFromLeft 0.3s cubic-bezier(0.2, 0.7, 0.24, 1) both;
}

.order-card {
  border-radius: 28rpx;
  overflow: hidden;
  border: 1rpx solid #d3ccbf;
  background: #f3efe6;
  box-shadow: 0 10rpx 26rpx rgba(63, 53, 39, 0.08);
}

.order-list.slide-from-right .order-card {
  animation: cardShiftFromRight 0.34s cubic-bezier(0.2, 0.7, 0.24, 1) both;
  animation-delay: var(--order-enter-delay, 0ms);
}

.order-list.slide-from-left .order-card {
  animation: cardShiftFromLeft 0.34s cubic-bezier(0.2, 0.7, 0.24, 1) both;
  animation-delay: var(--order-enter-delay, 0ms);
}

.order-card-head {
  padding: 18rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.head-meta {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
  font-size: 23rpx;
  color: #9e9588;
}

.role-text {
  color: #8f8679;
}

.head-dot {
  color: #b3ab9f;
}

.time-text {
  color: #9e9588;
}

.status-chip {
  min-width: 108rpx;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  border: 1rpx solid #d0c8bc;
  background: rgba(245, 240, 231, 0.9);
  color: #8a8174;
  font-size: 24rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-chip.pending {
  background: #f8ece8;
  border-color: #d2826f;
  color: #bf4c34;
}

.status-chip.paid,
.status-chip.shipped {
  background: #f7f0df;
  border-color: #dcbf8b;
  color: #997539;
}

.status-chip.completed,
.status-chip.cancelled {
  background: #ece7dd;
  border-color: #cec7bc;
  color: #7f776b;
}

.order-divider {
  height: 1rpx;
  background: #d8d1c4;
}

.order-card-body {
  display: grid;
  grid-template-columns: 118rpx minmax(0, 1fr) 220rpx;
  column-gap: 18rpx;
  padding: 22rpx 24rpx 16rpx;
  align-items: start;
}

.order-card-body.without-image {
  grid-template-columns: minmax(0, 1fr) 220rpx;
}

.order-card-body.without-side {
  grid-template-columns: 118rpx minmax(0, 1fr);
}

.order-card-body.without-image.without-side {
  grid-template-columns: minmax(0, 1fr);
}

.order-image {
  width: 118rpx;
  height: 118rpx;
  border-radius: 20rpx;
  background: #d8d1c4;
  flex-shrink: 0;
}

.goods-main {
  flex: 1;
  min-width: 0;
  min-height: 118rpx;
  display: flex;
  flex-direction: column;
}

.order-card-body.without-image .goods-main {
  min-height: 92rpx;
}

.goods-title {
  font-size: 32rpx;
  line-height: 1.45;
  color: #211d18;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.goods-price {
  margin-top: auto;
  padding-top: 10rpx;
  font-size: 40rpx;
  line-height: 1.1;
  color: #b13d28;
  font-weight: 700;
}

.goods-side {
  min-width: 0;
  max-width: 220rpx;
  text-align: right;
  min-height: 118rpx;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.order-card-body.without-image .goods-side {
  min-height: 92rpx;
}

.counterpart-text {
  display: block;
  width: 100%;
  font-size: 23rpx;
  line-height: 1.4;
  color: #948b80;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-card-actions {
  padding: 4rpx 24rpx 22rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.action-btn {
  margin: 0;
  min-height: 58rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  line-height: 58rpx;
  font-size: 25rpx;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.action-ghost,
.action-outline {
  color: #6b6459;
  border: 1rpx solid #ccc4b8;
  background: rgba(247, 243, 235, 0.9);
}

.action-primary {
  color: #ffffff;
  border: 1rpx solid #27231e;
  background: #27231e;
  box-shadow: 0 10rpx 20rpx rgba(39, 35, 30, 0.2);
}

.action-icon {
  font-size: 24rpx;
}

.list-empty-state {
  will-change: transform;
}

.list-empty-state.slide-from-right {
  animation: listSlideFromRight 0.3s cubic-bezier(0.2, 0.7, 0.24, 1) both;
}

.list-empty-state.slide-from-left {
  animation: listSlideFromLeft 0.3s cubic-bezier(0.2, 0.7, 0.24, 1) both;
}

.list-loading {
  min-height: 340rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  color: #9c9488;
}

.list-loading.slide-from-right {
  animation: listSlideFromRight 0.3s cubic-bezier(0.2, 0.7, 0.24, 1) both;
}

.list-loading.slide-from-left {
  animation: listSlideFromLeft 0.3s cubic-bezier(0.2, 0.7, 0.24, 1) both;
}

.loading-icon {
  font-size: 34rpx;
  animation: spinnerRotate 0.9s linear infinite;
}

.loading-text {
  font-size: 24rpx;
  color: #9c9488;
}

.order-page :deep(.tabbar-shell) {
  background: rgba(255, 255, 255, 0.94);
}

@keyframes listSlideFromRight {
  from {
    transform: translateX(68rpx);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes listSlideFromLeft {
  from {
    transform: translateX(-68rpx);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes cardShiftFromRight {
  from {
    transform: translateX(40rpx);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes cardShiftFromLeft {
  from {
    transform: translateX(-40rpx);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes spinnerRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
