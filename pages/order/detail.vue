<template>
  <view class="market-page order-detail-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar detail-topbar">
        <view class="market-back-btn" @click="goBack">
          <text class="market-back-symbol">‹</text>
        </view>
        <view class="market-page-title">订单详情</view>
        <view class="market-icon-btn placeholder-btn"></view>
      </view>

      <view class="status-hero">
        <view class="status-icon">✓</view>
        <view class="status-title">{{ order.statusText }}</view>
        <view class="status-subtitle">{{ statusSubtitle }}</view>
      </view>
    </view>

    <view class="market-shell detail-shell">
      <view class="market-card detail-card">
        <view class="market-section-title">交付联系</view>
        <view v-if="addressText" class="detail-line strong">{{ addressText }}</view>
        <view v-else class="detail-line strong">暂无交付联系信息</view>
        <view class="detail-line">{{ deliveryHint }}</view>
      </view>

      <view class="market-card detail-card">
        <view class="market-section-title">商品信息</view>
        <view class="goods-block" :class="{ 'without-image': !order.imageUrl }">
          <image v-if="order.imageUrl" class="goods-image" :src="order.imageUrl" mode="aspectFill"></image>
          <view class="goods-main">
            <view class="goods-title">{{ order.goodsTitle }}</view>
            <view v-if="order.counterpartName" class="goods-meta">{{ order.counterpartName }}</view>
            <view class="goods-price market-price">¥{{ order.totalAmountText }}</view>
          </view>
        </view>
      </view>

      <view class="market-card detail-card">
        <view class="market-section-title">订单信息</view>
        <view class="info-list">
          <view class="info-row">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ order.orderNo }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ order.createdAtText }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">商品单价</text>
            <text class="info-value">¥{{ order.goodsPriceText }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">购买数量</text>
            <text class="info-value">{{ order.quantity }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">当前状态</text>
            <StatusTag :status="order.statusText" :type="order.statusType" />
          </view>
          <view v-if="order.payTimeText" class="info-row">
            <text class="info-label">付款时间</text>
            <text class="info-value">{{ order.payTimeText }}</text>
          </view>
          <view v-if="order.shipTimeText" class="info-row">
            <text class="info-label">发货时间</text>
            <text class="info-value">{{ order.shipTimeText }}</text>
          </view>
          <view v-if="order.finishTimeText" class="info-row">
            <text class="info-label">完成时间</text>
            <text class="info-value">{{ order.finishTimeText }}</text>
          </view>
          <view v-if="order.cancelReason" class="info-row align-start">
            <text class="info-label">取消原因</text>
            <text class="info-value multiline">{{ order.cancelReason }}</text>
          </view>
        </view>
      </view>

      <view class="market-card detail-card">
        <view class="market-section-title">交易备注</view>
        <view class="detail-line strong">{{ orderRemark }}</view>
      </view>

      <view class="market-card detail-card">
        <view class="market-section-title">订单进度</view>
        <view class="timeline-list">
          <view v-for="(item, index) in timeline" :key="`${item.text}-${index}`" class="timeline-item">
            <view class="timeline-axis">
              <view class="timeline-dot" :class="{ done: item.done }"></view>
              <view v-if="index < timeline.length - 1" class="timeline-line" :class="{ done: item.done }"></view>
            </view>
            <view class="timeline-content">
              <view class="timeline-text" :class="{ active: item.done }">{{ item.text }}</view>
              <view v-if="item.time" class="timeline-time">{{ item.time }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="detail-footer market-card">
      <view class="footer-price">
        <text class="footer-price-label">实付金额</text>
        <text class="footer-price-value market-price">¥{{ order.totalAmountText }}</text>
      </view>
      <view class="footer-actions">
        <button class="market-secondary-btn footer-btn" @click="handleSecondaryAction">{{ secondaryActionText }}</button>
        <button class="market-primary-btn footer-btn" @click="handlePrimaryAction">{{ primaryActionText }}</button>
      </view>
    </view>
  </view>
</template>

<script>
import { cancelOrder, completeOrder, deleteOrder, getOrderDetail, payOrder, shipOrder } from '../../api/order'
import StatusTag from '../../components/StatusTag.vue'
import { useAuthStore } from '../../store/auth'
import { useOrderStore } from '../../store/order'
import {
  buildOrderTimeline,
  createCampusAddress,
  normalizeOrderItem
} from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    StatusTag
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      id: '',
      authStore: useAuthStore(),
      orderStore: useOrderStore(),
      order: normalizeOrderItem({}, 0)
    }
  },
  computed: {
    timeline() {
      return buildOrderTimeline(this.order)
    },
    addressText() {
      return createCampusAddress(this.order)
    },
    deliveryHint() {
      if (this.order.status === 'SHIPPED' || this.order.status === 'COMPLETED') {
        return '商品已进入当面交付阶段，建议保留聊天记录并核对商品配件。'
      }
      if (this.order.status === 'PAID') {
        return '卖家确认后会在约定地点交付商品，你可以继续和对方确认具体时间。'
      }
      return '校园二手交易默认采用校内面交，请提前确认地点和时间。'
    },
    orderRemark() {
      if (this.order.cancelReason) {
        return `订单备注：${this.order.cancelReason}`
      }
      if (this.order.status === 'COMPLETED') {
        return '本次交易已完成，如商品存在问题请尽快联系对方沟通。'
      }
      if (this.order.status === 'SHIPPED') {
        return '卖家已确认交付，若你已经收到商品，请尽快确认收货完成交易。'
      }
      if (this.order.status === 'PAID') {
        return '订单已付款成功，等待卖家完成交付。'
      }
      return '若临时变更时间或地点，建议通过站内消息及时同步，避免跑空。'
    },
    statusSubtitle() {
      if (this.order.status === 'PENDING_PAYMENT') {
        return '请尽快完成付款，避免订单超时取消。'
      }
      if (this.order.status === 'PAID') {
        return '买家已完成付款，请等待卖家发货。'
      }
      if (this.order.status === 'SHIPPED') {
        return '商品已经发出，记得及时确认收货。'
      }
      if (this.order.status === 'COMPLETED') {
        return '交易已顺利完成，欢迎继续逛逛新的闲置。'
      }
      return '订单流程已结束，如有问题请联系对方沟通。'
    },
    primaryActionText() {
      if (this.order.roleType === 'BUYER' && this.order.status === 'PENDING_PAYMENT') {
        return '立即支付'
      }
      if (this.order.roleType === 'SELLER' && this.order.status === 'PAID') {
        return '确认发货'
      }
      if (this.order.roleType === 'BUYER' && this.order.status === 'SHIPPED') {
        return '确认收货'
      }
      return '返回订单列表'
    },
    secondaryActionText() {
      if (this.order.roleType === 'BUYER' && this.order.status === 'PENDING_PAYMENT') {
        return '取消订单'
      }
      if (this.canDeleteOrder) {
        return '删除订单'
      }
      return '联系对方'
    },
    canDeleteOrder() {
      return ['COMPLETED', 'CANCELLED'].includes(this.order.status)
    }
  },
  onLoad(options) {
    if (!this.ensureLogin()) {
      return
    }
    syncThemePage(this)
    this.id = (options && options.id) || ''
    if (!this.id) {
      uni.showToast({ title: '缺少订单编号', icon: 'none' })
      return
    }
    this.loadOrder()
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
    loadOrder() {
      const cached = this.orderStore.sync().currentOrder
      if (cached && String(cached.id) === String(this.id)) {
        this.order = normalizeOrderItem(cached, 0)
      }

      getOrderDetail(this.id)
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            this.order = normalizeOrderItem(res.data, 0)
            this.orderStore.setCurrentOrder(this.order)
            return
          }
          uni.showToast({ title: (res && res.message) || '订单不存在或已失效', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '订单加载失败', icon: 'none' })
        })
    },
    handlePrimaryAction() {
      if (this.order.roleType === 'BUYER' && this.order.status === 'PENDING_PAYMENT') {
        this.runAction(() => payOrder(this.order.id), '订单已支付')
        return
      }
      if (this.order.roleType === 'SELLER' && this.order.status === 'PAID') {
        this.runAction(() => shipOrder(this.order.id), '订单已发货')
        return
      }
      if (this.order.roleType === 'BUYER' && this.order.status === 'SHIPPED') {
        this.runAction(() => completeOrder(this.order.id), '交易已完成')
        return
      }
      this.goBack()
    },
    handleSecondaryAction() {
      if (this.order.roleType === 'BUYER' && this.order.status === 'PENDING_PAYMENT') {
        this.runAction(() => cancelOrder(this.order.id), '订单已取消')
        return
      }
      if (this.canDeleteOrder) {
        this.confirmDelete()
        return
      }
      uni.showToast({ title: this.order.counterpartName ? `请联系${this.order.counterpartName}` : '请通过聊天页联系对方', icon: 'none' })
    },
    confirmDelete() {
      uni.showModal({
        title: '删除订单',
        content: '删除后该订单会从你的列表中移除，确认继续吗？',
        success: ({ confirm }) => {
          if (!confirm) {
            return
          }
          deleteOrder(this.order.id)
            .then((res) => {
              if (res && res.code === 0) {
                this.orderStore.setCurrentOrder(null)
                uni.showToast({ title: res.message || '订单已删除', icon: 'success' })
                setTimeout(() => {
                  uni.reLaunch({ url: '/pages/order/list' })
                }, 260)
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
    runAction(action, title) {
      action()
        .then((res) => {
          if (res && res.code === 0) {
            this.order = normalizeOrderItem(res.data || this.order, 0)
            this.orderStore.setCurrentOrder(this.order)
            uni.showToast({ title: res.message || '操作成功', icon: 'success' })
            return
          }
          uni.showToast({ title: (res && res.message) || '操作失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '操作失败', icon: 'none' })
        })
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/order/list' })
        }
      })
    }
  }
}
</script>

<style scoped>
.order-detail-page {
  padding-bottom: 200rpx;
}

.detail-topbar {
  margin-bottom: 22rpx;
}

.placeholder-btn {
  opacity: 0;
}

.status-hero {
  border-radius: 30rpx;
  padding: 36rpx 28rpx;
  background: linear-gradient(135deg, #2d6a4f 0%, #1b5e20 100%);
  color: #ffffff;
  text-align: center;
}

.status-icon {
  width: 88rpx;
  height: 88rpx;
  margin: 0 auto 18rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  font-weight: 700;
}

.status-title {
  font-size: 34rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.status-subtitle {
  font-size: 23rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
}

.detail-shell {
  padding-top: 24rpx;
}

.detail-card {
  padding: 24rpx;
  margin-bottom: 18rpx;
}

.detail-line {
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.8;
  color: #6c757d;
}

.detail-line.strong {
  color: #2c3e50;
}

.goods-block {
  display: flex;
  gap: 18rpx;
  margin-top: 20rpx;
}

.goods-block.without-image {
  gap: 0;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  flex-shrink: 0;
}

.goods-main {
  flex: 1;
  min-width: 0;
}

.goods-title {
  font-size: 28rpx;
  line-height: 1.5;
  color: #2c3e50;
  margin-bottom: 14rpx;
}

.goods-meta {
  font-size: 22rpx;
  color: #6c757d;
  margin-bottom: 18rpx;
}

.goods-price {
  font-size: 34rpx;
}

.info-list {
  margin-top: 16rpx;
}

.info-row {
  min-height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.info-row.align-start {
  align-items: flex-start;
  padding-top: 10rpx;
}

.info-label {
  font-size: 23rpx;
  color: #6c757d;
}

.info-value {
  font-size: 23rpx;
  color: #2c3e50;
  text-align: right;
}

.info-value.multiline {
  flex: 1;
  text-align: left;
  line-height: 1.8;
}

.timeline-list {
  margin-top: 18rpx;
}

.timeline-item {
  display: flex;
  gap: 16rpx;
}

.timeline-axis {
  width: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  border: 2rpx solid #d7dee5;
  background: #ffffff;
}

.timeline-dot.done {
  border-color: #2d6a4f;
  background: #2d6a4f;
}

.timeline-line {
  width: 2rpx;
  min-height: 54rpx;
  background: #d7dee5;
}

.timeline-line.done {
  background: #2d6a4f;
}

.timeline-content {
  flex: 1;
  padding-bottom: 18rpx;
}

.timeline-text {
  font-size: 24rpx;
  color: #adb5bd;
  margin-bottom: 8rpx;
}

.timeline-text.active {
  color: #2c3e50;
}

.timeline-time {
  font-size: 22rpx;
  color: #6c757d;
}

.detail-footer {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(20rpx + env(safe-area-inset-bottom));
  padding: 18rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18rpx;
  z-index: 18;
}

.footer-price {
  min-width: 170rpx;
}

.footer-price-label {
  display: block;
  font-size: 21rpx;
  color: #6c757d;
  margin-bottom: 8rpx;
}

.footer-price-value {
  font-size: 34rpx;
}

.footer-actions {
  flex: 1;
  display: flex;
  gap: 14rpx;
}

.footer-btn {
  flex: 1;
}
</style>
