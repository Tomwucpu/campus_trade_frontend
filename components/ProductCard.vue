<template>
  <view class="product-card market-card" @click="$emit('click')">
    <view class="product-cover">
      <image class="product-image" :src="goods.imageUrl" mode="aspectFill"></image>
      <view class="product-cover-shadow"></view>
      <view class="product-condition">{{ goods.conditionLabel }}</view>
      <view class="product-favorite" @click.stop="toggleFavorite">
        {{ favoriteState ? '♥' : '♡' }}
      </view>
    </view>

    <view class="product-body">
      <view class="product-title">{{ goods.title }}</view>
      <view class="product-price-row">
        <text class="product-price market-price">¥{{ goods.priceText }}</text>
        <text v-if="goods.originalPriceText" class="product-origin">¥{{ goods.originalPriceText }}</text>
      </view>
      <view class="product-meta">
        <view class="product-time">{{ goods.publishedAtText }}</view>
        <view class="product-seller">{{ goods.sellerName }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { addFavorite, removeFavorite } from '../api/favorite'
import { useAuthStore } from '../store/auth'

export default {
  emits: ['click', 'favorite-change'],
  props: {
    goods: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      favoriteState: false,
      toggling: false,
      authStore: useAuthStore()
    }
  },
  watch: {
    goods: {
      immediate: true,
      deep: true,
      handler(value) {
        this.favoriteState = Boolean(value && value.isFavorite)
      }
    }
  },
  methods: {
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      uni.showToast({ title: '请先登录后再收藏', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    toggleFavorite() {
      if (this.toggling) {
        return
      }
      if (!this.ensureLogin()) {
        return
      }

      const next = !this.favoriteState
      const action = next ? () => addFavorite(this.goods.id) : () => removeFavorite(this.goods.id)
      this.toggling = true
      action()
        .then((res) => {
          if (res && res.code === 0) {
            this.favoriteState = next
            this.$emit('favorite-change', { id: this.goods.id, value: next })
            uni.showToast({ title: res.message || (next ? '收藏成功' : '已取消收藏'), icon: 'none' })
            return
          }
          uni.showToast({ title: (res && res.message) || '操作失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '操作失败', icon: 'none' })
        })
        .finally(() => {
          this.toggling = false
        })
    }
  }
}
</script>

<style scoped>
.product-card {
  overflow: hidden;
}

.product-cover {
  position: relative;
  height: 260rpx;
  background: #f8f9fa;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-cover-shadow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.18) 100%);
}

.product-condition {
  position: absolute;
  left: 16rpx;
  bottom: 16rpx;
  padding: 8rpx 14rpx;
  border-radius: 14rpx;
  background: #e8f5e9;
  color: #1b5e20;
  font-size: 20rpx;
  font-weight: 600;
}

.product-favorite {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #f77f00;
}

.product-body {
  padding: 20rpx;
}

.product-title {
  min-height: 78rpx;
  font-size: 26rpx;
  line-height: 1.45;
  color: #2c3e50;
  margin-bottom: 14rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.product-price {
  font-size: 34rpx;
}

.product-origin {
  font-size: 20rpx;
  color: #adb5bd;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  font-size: 20rpx;
  color: #6c757d;
}

.product-seller {
  max-width: 120rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
