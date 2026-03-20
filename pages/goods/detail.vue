<template>
  <view class="app-page detail-page" :class="themeClass">
    <view class="detail-hero app-card" :class="detail.coverStyle">
      <view class="detail-hero-wash"></view>
      <view class="detail-stamp">{{ detail.stampText }}</view>
      <view class="detail-hero-bottom">
        <view class="detail-category">{{ detail.categoryLabel }}</view>
        <view class="detail-hero-title">{{ detail.title }}</view>
      </view>
    </view>

    <view class="detail-card app-card">
      <view class="price-line">
        <view class="detail-price app-price">¥{{ detail.priceText }}</view>
        <view class="detail-views">{{ detail.wishCount }} 人想要 · {{ detail.glanceCount }} 浏览</view>
      </view>
      <view class="detail-title">{{ detail.title }}</view>
      <view class="detail-tags">
        <text v-for="badge in detail.badges" :key="badge" class="detail-tag">{{ badge }}</text>
      </view>
      <view class="detail-desc">{{ detail.description }}</view>
    </view>

    <view class="seller-card app-card">
      <view class="seller-main">
        <view class="seller-avatar">{{ detail.sellerName.slice(0, 1) }}</view>
        <view class="seller-copy">
          <view class="seller-name">{{ detail.sellerName }}</view>
          <view class="seller-meta">面交地点：{{ detail.campusArea }}</view>
        </view>
      </view>
      <view class="seller-chip">{{ detail.conditionLabel }}</view>
    </view>

    <view class="note-card app-card">
      <view class="note-title">交易提醒</view>
      <view class="note-text">
        建议在校园公开区域当面验货，确认配件完整、价格一致后再完成交易；如需进一步沟通，可直接联系卖家。
      </view>
    </view>

    <view class="bottom-bar app-card">
      <view class="bottom-actions">
        <view class="mini-action" @click="chatSeller">
          <text class="mini-action-icon">聊</text>
          <text class="mini-action-label">联系卖家</text>
        </view>
        <view class="mini-action" @click="backToList">
          <text class="mini-action-icon">市</text>
          <text class="mini-action-label">回到列表</text>
        </view>
      </view>
      <button class="app-primary-btn want-btn" @click="wantThis">我想要</button>
    </view>
  </view>
</template>

<script>
import { getGoodsDetail } from '../../api/goods'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import { useOrderStore } from '../../store/order'
import { normalizeGoodsItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  data() {
    return {
      id: '',
      theme: 'light',
      themeClass: '',
      authStore: useAuthStore(),
      goodsStore: useGoodsStore(),
      orderStore: useOrderStore(),
      detail: normalizeGoodsItem({}, 0)
    }
  },
  onLoad(options) {
    syncThemePage(this)
    this.id = (options && options.id) || ''
    if (this.id) {
      this.goodsStore.setLastViewedId(this.id)
    }
    this.fetchDetail()
  },
  onShow() {
    syncThemePage(this)
    this.authStore.sync()
  },
  methods: {
    fetchDetail() {
      if (!this.id) {
        uni.showToast({ title: '缺少商品编号', icon: 'none' })
        return
      }

      getGoodsDetail(this.id)
        .then((res) => {
          if (res && res.code === 0) {
            this.detail = normalizeGoodsItem(res.data || {}, 0)
            return
          }
          uni.showToast({ title: (res && res.message) || '详情加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '详情加载失败', icon: 'none' })
        })
    },
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      uni.showToast({ title: '请先登录后继续', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 300)
      return false
    },
    chatSeller() {
      if (!this.ensureLogin()) {
        return
      }
      uni.showToast({ title: '请与卖家沟通面交细节', icon: 'none' })
    },
    backToList() {
      uni.navigateTo({ url: '/pages/goods/list' })
    },
    wantThis() {
      if (!this.ensureLogin()) {
        return
      }
      this.orderStore.setCurrentOrderId(this.id)
      uni.navigateTo({ url: '/pages/order/list' })
    }
  }
}
</script>

<style scoped>
.detail-page {
  padding-bottom: calc(170rpx + env(safe-area-inset-bottom));
}

.detail-hero {
  height: 520rpx;
  position: relative;
  overflow: hidden;
  padding: 30rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.detail-hero-wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 22% 24%, rgba(255, 255, 255, 0.24) 0, transparent 24%),
    radial-gradient(circle at 82% 34%, rgba(255, 255, 255, 0.18) 0, transparent 24%),
    radial-gradient(circle at 48% 86%, rgba(255, 255, 255, 0.12) 0, transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0, transparent 30%);
}

.tone-0 {
  background: linear-gradient(160deg, #28251f 0%, #4b4337 56%, #847764 100%);
}

.tone-1 {
  background: linear-gradient(160deg, #3e372c 0%, #79614a 56%, #bb9a74 100%);
}

.tone-2 {
  background: linear-gradient(160deg, #1c1c1c 0%, #4a4a4a 56%, #818181 100%);
}

.tone-3 {
  background: linear-gradient(160deg, #2a2019 0%, #614636 56%, #a97b5e 100%);
}

.tone-4 {
  background: linear-gradient(160deg, #303030 0%, #5b5245 56%, #999083 100%);
}

.detail-stamp,
.detail-hero-bottom {
  position: relative;
  z-index: 1;
}

.detail-stamp {
  width: 100rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: rgba(250, 226, 120, 0.95);
  color: #2e2618;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
}

.detail-category {
  align-self: flex-start;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  color: #ffffff;
  font-size: 22rpx;
  margin-bottom: 18rpx;
}

.detail-hero-title {
  color: #ffffff;
  font-family: var(--ink-font-title);
  font-size: 48rpx;
  line-height: 1.35;
  max-width: 460rpx;
}

.detail-card {
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20rpx;
  margin-bottom: 18rpx;
}

.detail-price {
  font-size: 54rpx;
}

.detail-views {
  font-size: 22rpx;
  color: var(--ink-subtext);
  padding-bottom: 8rpx;
}

.detail-title {
  font-size: 40rpx;
  line-height: 1.45;
  color: var(--ink-text);
  margin-bottom: 18rpx;
}

.detail-tags {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  margin-bottom: 22rpx;
}

.detail-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  font-size: 22rpx;
}

.detail-desc {
  font-size: 27rpx;
  line-height: 1.9;
  color: var(--ink-text);
}

.seller-card,
.note-card {
  padding: 26rpx 30rpx;
  margin-bottom: 20rpx;
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
  gap: 20rpx;
}

.seller-avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 34rpx;
}

.seller-name {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 8rpx;
}

.seller-meta {
  font-size: 22rpx;
  color: var(--ink-subtext);
}

.seller-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-text);
  font-size: 22rpx;
}

.note-title {
  font-family: var(--ink-font-title);
  font-size: 34rpx;
  color: var(--ink-text);
  margin-bottom: 14rpx;
}

.note-text {
  color: var(--ink-subtext);
  font-size: 24rpx;
  line-height: 1.85;
}

.bottom-bar {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(18rpx + env(safe-area-inset-bottom));
  padding: 18rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.bottom-actions {
  display: flex;
  gap: 14rpx;
}

.mini-action {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  color: var(--ink-subtext);
}

.mini-action-icon {
  width: 58rpx;
  height: 58rpx;
  border-radius: 20rpx;
  background: var(--ink-accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 28rpx;
  color: var(--ink-text);
}

.mini-action-label {
  font-size: 20rpx;
}

.want-btn {
  flex: 1;
}
</style>
