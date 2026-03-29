<template>
  <view class="market-page detail-page" :class="themeClass">
    <view class="detail-floating safe-top">
      <view class="market-shell">
        <view class="market-topbar">
          <view class="market-back-btn floating-btn" @click="goBack">
            <uni-icons type="back" :size="20" color="#595f69"></uni-icons>
          </view>
          <view class="market-page-title floating-title">商品详情</view>
          <view class="market-icon-btn floating-btn" @click="shareDetail">
            <uni-icons type="redo" :size="18" color="#595f69"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <template v-if="hasDetail">
      <view v-if="hasGallery" class="detail-cover">
        <swiper class="cover-swiper" circular @change="onSwiperChange">
          <swiper-item v-for="(image, index) in detail.gallery" :key="`${detail.id}-${index}`">
            <image class="cover-image" :src="image" mode="aspectFill" @click="previewGallery(index)"></image>
          </swiper-item>
        </swiper>

        <view class="cover-dots">
          <view
            v-for="(image, index) in detail.gallery"
            :key="`dot-${index}`"
            class="cover-dot"
            :class="{ active: currentImageIndex === index }"
          ></view>
        </view>
      </view>

      <view class="market-shell detail-shell" :class="{ 'without-cover': !hasGallery }">
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
            <view v-if="detail.campusLocation" class="meta-item">{{ detail.campusLocation }}</view>
          </view>
        </view>

        <view v-if="hasSellerInfo" class="market-card seller-card">
          <view class="seller-main">
            <view class="seller-avatar">{{ (detail.sellerName || '卖').slice(0, 1) }}</view>
            <view class="seller-copy">
              <view v-if="detail.sellerName || detail.sellerRating" class="seller-name-row">
                <text class="seller-name">{{ detail.sellerName }}</text>
                <text v-if="detail.sellerRating" class="seller-rating">★{{ detail.sellerRating }}</text>
              </view>
              <view v-if="sellerSubtitle" class="seller-subtitle">{{ sellerSubtitle }}</view>
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
            <view class="tool-icon">
              <uni-icons :type="favorite ? 'heart-filled' : 'heart'" :size="22" :color="favorite ? '#c0554f' : '#5d646d'"></uni-icons>
            </view>
            <text class="tool-label">收藏</text>
          </view>
          <view class="tool-item" @click="openSellerChatSafe">
            <view class="tool-icon">
              <uni-icons type="chatboxes" :size="22" color="#5d646d"></uni-icons>
            </view>
            <text class="tool-label">联系</text>
          </view>
        </view>
        <button class="market-primary-btn buy-btn" :disabled="actionDisabled" @click="createTradeOrder">
          {{ actionText }}
        </button>
      </view>
    </template>

    <template v-else>
      <view class="market-shell detail-empty-shell">
        <view class="market-card detail-empty-card">
          <EmptyState
            icon="bi bi-box"
            title="暂无商品数据"
            description="当前没有可展示的商品信息，请在后端服务可用后再试。"
          />
        </view>
      </view>
    </template>
    <ImagePreviewer
      :visible="previewVisible"
      :images="hasGallery ? detail.gallery : []"
      :initial-index="previewIndex"
      @close="closePreview"
      @change="handlePreviewChange"
    />
  </view>
</template>

<script>
import { openConversationByGoods } from '../../api/chat'
import { addFavorite, removeFavorite } from '../../api/favorite'
import { getGoodsDetail } from '../../api/goods'
import { createOrder } from '../../api/order'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import EmptyState from '../../components/EmptyState.vue'
import ImagePreviewer from '../../components/ImagePreviewer.vue'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import { useOrderStore } from '../../store/order'
import { normalizeGoodsItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    UniIcons,
    EmptyState,
    ImagePreviewer
  },
  data() {
    return {
      id: '',
      fromPublish: false,
      theme: 'light',
      themeClass: 'theme-light',
      currentImageIndex: 0,
      previewVisible: false,
      previewIndex: 0,
      favoriteState: false,
      authStore: useAuthStore(),
      goodsStore: useGoodsStore(),
      orderStore: useOrderStore(),
      detail: null
    }
  },
  computed: {
    hasDetail() {
      return !!(this.detail && (this.detail.id || this.detail.id === 0))
    },
    hasGallery() {
      return this.hasDetail && Array.isArray(this.detail.gallery) && this.detail.gallery.length > 0
    },
    hasSellerInfo() {
      if (!this.hasDetail) {
        return false
      }
      return [this.detail.sellerName, this.detail.sellerRating, this.detail.sellerStudentNo, this.detail.campusLocation].some(Boolean)
    },
    sellerSubtitle() {
      if (!this.hasDetail) {
        return ''
      }
      return [this.detail.sellerStudentNo, this.detail.campusLocation].filter(Boolean).join(' · ')
    },
    favorite() {
      return this.favoriteState
    },
    isOwnGoods() {
      if (!this.hasDetail) {
        return false
      }
      return String(this.authStore.sync().getUserId() || '') === String(this.detail.sellerId || '')
    },
    actionDisabled() {
      return !this.hasDetail || this.isOwnGoods || this.detail.status !== 'ON_SALE'
    },
    actionText() {
      if (!this.hasDetail) {
        return '暂无商品'
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
    this.favoriteState = this.hasDetail && this.detail.isFavorite === true
  },
  onBackPress() {
    if (!this.previewVisible) {
      return false
    }
    this.closePreview()
    return true
  },
  methods: {
    clearDetail() {
      this.detail = null
      this.favoriteState = false
      this.currentImageIndex = 0
      this.previewVisible = false
      this.previewIndex = 0
    },
    onSwiperChange(event) {
      this.currentImageIndex = event.detail.current || 0
    },
    previewGallery(index = 0) {
      if (!this.hasGallery) {
        return
      }

      const urls = this.detail.gallery.filter(Boolean)
      if (!urls.length) {
        return
      }
      this.previewIndex = urls[index] ? index : 0
      this.previewVisible = true
    },
    handlePreviewChange(index = 0) {
      this.previewIndex = index
    },
    closePreview() {
      this.previewVisible = false
    },
    fetchDetail() {
      this.clearDetail()

      if (!this.id) {
        uni.showToast({ title: '缺少商品编号', icon: 'none' })
        return
      }

      getGoodsDetail(this.id)
        .then((res) => {
          if (res && res.code === 0 && res.data && (res.data.id || res.data.id === 0)) {
            this.detail = normalizeGoodsItem(res.data, 0)
            this.favoriteState = this.detail.isFavorite === true
            return
          }
          uni.showToast({ title: (res && res.message) || '详情加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '详情加载失败', icon: 'none' })
        })
    },
    toggleFavorite() {
      if (!this.hasDetail) {
        uni.showToast({ title: '暂无商品可收藏', icon: 'none' })
        return
      }
      if (!this.ensureLogin()) {
        return
      }

      const next = !this.favoriteState
      const action = next ? () => addFavorite(this.detail.id) : () => removeFavorite(this.detail.id)
      action()
        .then((res) => {
          if (res && res.code === 0) {
            const favoriteCount = Math.max(0, Number(this.detail.favoriteCount || 0) + (next ? 1 : -1))
            this.favoriteState = next
            this.detail = {
              ...this.detail,
              isFavorite: next,
              favoriteCount
            }
            uni.showToast({ title: res.message || (next ? '收藏成功' : '已取消收藏'), icon: 'none' })
            return
          }
          uni.showToast({ title: (res && res.message) || '操作失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '操作失败', icon: 'none' })
        })
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
    openSellerChatSafe() {
      if (!this.authStore.sync().isLoggedIn()) {
        uni.showToast({ title: '请先登录后联系商家', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user/login' })
        }, 260)
        return
      }
      if (this.isOwnGoods) {
        uni.showToast({ title: '这是你自己发布的商品', icon: 'none' })
        return
      }
      if (!this.hasDetail) {
        uni.showToast({ title: '商品信息加载中', icon: 'none' })
        return
      }

      openConversationByGoods(this.detail.id)
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
    openSellerChat() {
      this.openSellerChatSafe()
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
    shareDetail() {
      if (!this.id) {
        uni.showToast({ title: '暂无可分享内容', icon: 'none' })
        return
      }
      const sharePath = `/pages/goods/detail?id=${this.id}`
      uni.setClipboardData({
        data: sharePath,
        success: () => {
          uni.showToast({ title: '链接已复制', icon: 'none' })
        },
        fail: () => {
          uni.showToast({ title: '暂不支持分享', icon: 'none' })
        }
      })
    },
    goBack() {
      if (this.previewVisible) {
        this.closePreview()
        return
      }

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
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.92) 0, rgba(255, 255, 255, 0) 32%),
    linear-gradient(180deg, #edeff1 0%, #f8f7f3 260rpx, #fcfbf7 100%);
}

.detail-floating {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 32;
}

.detail-floating .market-shell {
  padding-bottom: 0;
}

.floating-btn {
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(214, 217, 222, 0.9);
  color: #595f69;
  box-shadow: 0 18rpx 36rpx rgba(25, 31, 38, 0.08);
}

.floating-title {
  color: #30343a;
  letter-spacing: 2rpx;
}

.detail-cover {
  position: relative;
  height: 720rpx;
  background: linear-gradient(135deg, #efefee 0%, #d8d9dc 100%);
}

.cover-swiper,
.cover-image {
  width: 100%;
  height: 100%;
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

.detail-shell.without-cover {
  margin-top: calc(var(--status-bar-height) + 118rpx);
}

.detail-empty-shell {
  padding-top: calc(var(--status-bar-height) + 118rpx);
}

.detail-empty-card {
  padding: 12rpx;
  overflow: hidden;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(235, 237, 240, 0.9);
  box-shadow: 0 18rpx 34rpx rgba(31, 35, 41, 0.05);
}

.info-card,
.seller-card,
.content-card {
  padding: 28rpx;
  margin-bottom: 20rpx;
  background: rgba(248, 248, 246, 0.96);
  border: 1rpx solid rgba(235, 237, 240, 0.92);
  box-shadow: 0 18rpx 34rpx rgba(31, 35, 41, 0.06);
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
  color: #c0554f;
  font-weight: 600;
}

.detail-origin {
  font-size: 22rpx;
  color: #afb4bc;
  text-decoration: line-through;
}

.detail-stats {
  font-size: 22rpx;
  line-height: 1.7;
  color: #8e949d;
  text-align: right;
}

.detail-title {
  font-size: 36rpx;
  line-height: 1.45;
  color: #3a3f46;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.meta-item {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(242, 243, 245, 0.96);
  border: 1rpx solid rgba(226, 228, 231, 0.8);
  color: #646a74;
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
  background: linear-gradient(135deg, #efefee 0%, #dfe1e4 100%);
  border: 1rpx solid rgba(226, 229, 233, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5d646d;
  font-size: 34rpx;
  font-weight: 600;
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
  font-weight: 600;
  color: #3a3f46;
}

.seller-rating {
  font-size: 22rpx;
  color: #c0554f;
}

.seller-subtitle {
  font-size: 22rpx;
  line-height: 1.7;
  color: #8a8f98;
}

.seller-action {
  min-width: 140rpx;
  min-height: 62rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(35, 35, 35, 0.96);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
  box-shadow: 0 14rpx 28rpx rgba(35, 35, 35, 0.12);
}

.content-text {
  margin-top: 18rpx;
  font-size: 25rpx;
  line-height: 1.9;
  color: #5d646d;
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
  background: rgba(252, 251, 247, 0.96);
  border: 1rpx solid rgba(235, 237, 240, 0.92);
  box-shadow: 0 20rpx 40rpx rgba(31, 35, 41, 0.08);
}

.buy-tools {
  display: flex;
  gap: 14rpx;
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
  background: rgba(242, 243, 245, 0.96);
  box-shadow: inset 0 0 0 1rpx rgba(226, 228, 231, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #5d646d;
}

.tool-label {
  font-size: 20rpx;
  color: #8a8f98;
}

.buy-btn {
  flex: 1;
  background: #232323;
  color: #ffffff;
  box-shadow: 0 16rpx 30rpx rgba(35, 35, 35, 0.16);
}

.buy-btn[disabled] {
  background: #bcc1c8;
  color: rgba(255, 255, 255, 0.94);
  box-shadow: none;
}

.detail-page :deep(.market-tag) {
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(215, 110, 98, 0.2);
  color: #c0554f;
}

.detail-page :deep(.market-section-title) {
  color: #2f3339;
}
</style>
