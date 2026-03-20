<template>
  <view class="market-page detail-page" :class="themeClass">
    <view class="detail-cover">
      <swiper class="cover-swiper" circular @change="onSwiperChange">
        <swiper-item v-for="(image, index) in detail.gallery" :key="`${detail.id}-${index}`">
          <image class="cover-image" :src="image" mode="aspectFill"></image>
        </swiper-item>
      </swiper>

      <view class="cover-top safe-top">
        <view class="market-shell">
          <view class="market-topbar">
            <view class="market-back-btn transparent" @click="goBack">
              <text class="market-back-symbol">‹</text>
            </view>
            <view class="market-icon-btn transparent">↗</view>
          </view>
        </view>
      </view>

      <view class="cover-dots">
        <view
          v-for="(image, index) in detail.gallery"
          :key="`dot-${index}`"
          class="cover-dot"
          :class="{ active: currentImageIndex === index }"
        ></view>
      </view>
    </view>

    <view class="market-shell detail-shell">
      <view class="market-card info-card">
        <view class="price-row">
          <view class="price-wrap">
            <text class="detail-price market-price">¥{{ detail.priceText }}</text>
            <text v-if="detail.originalPriceText" class="detail-origin">原价 ¥{{ detail.originalPriceText }}</text>
            <text class="market-tag">{{ detail.conditionLabel }}</text>
          </view>
          <view class="detail-stats">{{ detail.viewCount }}次浏览 · {{ detail.favoriteCount }}人收藏</view>
        </view>

        <view class="detail-title">{{ detail.title }}</view>

        <view class="detail-meta">
          <view class="meta-item">发布时间 {{ detail.createdAtText }}</view>
          <view class="meta-item">{{ detail.categoryLabel }}</view>
          <view class="meta-item">{{ detail.campusLocation }}</view>
        </view>
      </view>

      <view class="market-card seller-card">
        <view class="seller-main">
          <view class="seller-avatar">{{ detail.sellerName.slice(0, 1) }}</view>
          <view class="seller-copy">
            <view class="seller-name-row">
              <text class="seller-name">{{ detail.sellerName }}</text>
              <text class="seller-rating">★ {{ detail.sellerRating }}</text>
            </view>
            <view class="seller-subtitle">{{ detail.sellerStudentNo }} · {{ detail.campusLocation }}</view>
          </view>
        </view>
        <view class="seller-action">查看主页</view>
      </view>

      <view class="market-card content-card">
        <view class="market-section-title">商品描述</view>
        <view class="content-text">{{ detail.description }}</view>
      </view>
    </view>

    <view class="buy-bar market-card">
      <view class="buy-tools">
        <view class="tool-item" @click="toggleFavorite">
          <text class="tool-icon">{{ favorite ? '♥' : '♡' }}</text>
          <text class="tool-label">收藏</text>
        </view>
        <view class="tool-item" @click="chatSeller">
          <text class="tool-icon">聊</text>
          <text class="tool-label">咨询</text>
        </view>
      </view>
      <button class="market-primary-btn buy-btn" :disabled="actionDisabled" @click="createTradeOrder">
        {{ actionText }}
      </button>
    </view>
  </view>
</template>

<script>
import { getGoodsDetail } from '../../api/goods'
import { createOrder } from '../../api/order'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import { useOrderStore } from '../../store/order'
import {
  getFallbackGoodsList,
  isFavoriteGoods,
  normalizeGoodsItem,
  pushLocalMessage,
  toggleFavoriteGoods
} from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  data() {
    return {
      id: '',
      fromPublish: false,
      theme: 'light',
      themeClass: 'theme-light',
      currentImageIndex: 0,
      favoriteState: false,
      authStore: useAuthStore(),
      goodsStore: useGoodsStore(),
      orderStore: useOrderStore(),
      detail: normalizeGoodsItem(getFallbackGoodsList()[0] || {}, 0)
    }
  },
  computed: {
    favorite() {
      return this.favoriteState
    },
    isOwnGoods() {
      return String(this.authStore.sync().getUserId() || '') === String(this.detail.sellerId || '')
    },
    actionDisabled() {
      return !this.detail.id || this.isOwnGoods || this.detail.status !== 'ON_SALE'
    },
    actionText() {
      if (!this.detail.id) {
        return '加载中'
      }
      if (this.isOwnGoods) {
        return '这是我发布的'
      }
      if (this.detail.status !== 'ON_SALE') {
        return '当前不可下单'
      }
      return '立即购买'
    }
  },
  onLoad(options) {
    syncThemePage(this)
    this.id = (options && options.id) || ''
    this.fromPublish = String((options && options.fromPublish) || '') === '1'
    if (this.id) {
      this.goodsStore.setLastViewedId(this.id)
    }
    this.fetchDetail()
  },
  onShow() {
    syncThemePage(this)
    this.authStore.sync()
    this.favoriteState = isFavoriteGoods(this.detail.id)
  },
  methods: {
    onSwiperChange(event) {
      this.currentImageIndex = event.detail.current || 0
    },
    fetchDetail() {
      if (!this.id) {
        uni.showToast({ title: '缺少商品编号', icon: 'none' })
        return
      }

      getGoodsDetail(this.id)
        .then((res) => {
          if (res && res.code === 0) {
            this.detail = normalizeGoodsItem(res.data || {}, 0)
            this.favoriteState = isFavoriteGoods(this.detail.id)
            return
          }
          uni.showToast({ title: (res && res.message) || '详情加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '详情加载失败', icon: 'none' })
        })
    },
    toggleFavorite() {
      const next = toggleFavoriteGoods(this.detail.id)
      this.favoriteState = next
      uni.showToast({ title: next ? '已加入收藏' : '已取消收藏', icon: 'none' })
    },
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      uni.showToast({ title: '请先登录后继续', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    chatSeller() {
      if (!this.ensureLogin()) {
        return
      }
      uni.showToast({ title: `建议与${this.detail.sellerName}约在校内面交`, icon: 'none' })
    },
    createTradeOrder() {
      if (this.actionDisabled) {
        uni.showToast({ title: this.actionText, icon: 'none' })
        return
      }
      if (!this.ensureLogin()) {
        return
      }

      createOrder({ goodsId: Number(this.id) })
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            this.orderStore.setCurrentOrder(res.data)
            pushLocalMessage({
              type: 'order',
              title: '订单创建成功',
              content: `你已成功下单“${this.detail.title}”，请尽快完成付款。`
            })
            uni.showToast({ title: res.message || '下单成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/order/list' })
            }, 260)
            return
          }

          uni.showToast({ title: (res && res.message) || '下单失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '下单失败', icon: 'none' })
        })
    },
    goBack() {
      if (this.fromPublish) {
        uni.reLaunch({ url: '/pages/index/index' })
        return
      }
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/goods/list' })
        }
      })
    }
  }
}
</script>

<style scoped>
.detail-page {
  padding-bottom: 180rpx;
}

.detail-cover {
  position: relative;
  height: 720rpx;
  background: #f8f9fa;
}

.cover-swiper,
.cover-image {
  width: 100%;
  height: 100%;
}

.cover-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.cover-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 32rpx;
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.cover-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
}

.cover-dot.active {
  width: 38rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.detail-shell {
  margin-top: -34rpx;
  position: relative;
  z-index: 2;
}

.info-card,
.seller-card,
.content-card {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  flex-wrap: wrap;
}

.detail-price {
  font-size: 50rpx;
}

.detail-origin {
  font-size: 22rpx;
  color: #adb5bd;
  text-decoration: line-through;
}

.detail-stats {
  font-size: 22rpx;
  line-height: 1.7;
  color: #6c757d;
  text-align: right;
}

.detail-title {
  font-size: 36rpx;
  line-height: 1.45;
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.meta-item {
  padding: 10rpx 16rpx;
  border-radius: 14rpx;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 22rpx;
}

.seller-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18rpx;
}

.seller-main {
  display: flex;
  align-items: center;
  gap: 18rpx;
  flex: 1;
}

.seller-avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d6a4f;
  font-size: 34rpx;
  font-weight: 700;
}

.seller-copy {
  flex: 1;
}

.seller-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.seller-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #2c3e50;
}

.seller-rating {
  font-size: 22rpx;
  color: #f77f00;
}

.seller-subtitle {
  font-size: 22rpx;
  line-height: 1.7;
  color: #6c757d;
}

.seller-action {
  min-width: 140rpx;
  min-height: 62rpx;
  padding: 0 18rpx;
  border-radius: 16rpx;
  background: #e8f5e9;
  color: #2d6a4f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

.content-text {
  margin-top: 18rpx;
  font-size: 25rpx;
  line-height: 1.9;
  color: #6c757d;
}

.buy-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(20rpx + env(safe-area-inset-bottom));
  padding: 18rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  z-index: 18;
}

.buy-tools {
  display: flex;
  gap: 12rpx;
}

.tool-item {
  width: 110rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.tool-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #2d6a4f;
}

.tool-label {
  font-size: 20rpx;
  color: #6c757d;
}

.buy-btn {
  flex: 1;
}
</style>
