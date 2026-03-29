<template>
  <view class="product-card market-card" :class="cardClasses" @click="$emit('click')">
    <view v-if="goods.imageUrl" class="product-cover">
      <image class="product-image" :src="goods.imageUrl" mode="aspectFill"></image>
      <view class="product-cover-shadow"></view>
      <view class="product-condition">{{ goods.conditionLabel }}</view>
    </view>

    <view class="product-favorite" @click.stop="toggleFavorite">
      <uni-icons :type="favoriteState ? 'heart-filled' : 'heart'" :size="18" :color="favoriteState ? '#e57373' : '#8c9199'"></uni-icons>
    </view>

    <view class="product-body">
      <view class="product-title">{{ goods.title }}</view>
      <view class="product-price-row">
        <text class="product-price market-price">¥{{ goods.priceText }}</text>
        <text v-if="goods.originalPriceText" class="product-origin">¥{{ goods.originalPriceText }}</text>
      </view>
      <view class="product-meta">
        <view class="product-time">{{ goods.publishedAtText }}</view>
        <view v-if="goods.sellerName" class="product-seller">{{ goods.sellerName }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { addFavorite, removeFavorite } from '../api/favorite'
import { useAuthStore } from '../store/auth'

export default {
  emits: ['click', 'favorite-change'],
  components: {
    UniIcons
  },
  props: {
    goods: {
      type: Object,
      default: () => ({})
    },
    variant: {
      type: String,
      default: 'default'
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
  computed: {
    cardClasses() {
      return {
        'without-image': !this.goods.imageUrl,
        'product-card--home': this.variant === 'home'
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
  position: relative;
}

.product-card.product-card--home {
  border-radius: 26rpx;
  border: 1rpx solid rgba(235, 237, 240, 0.92);
  background: rgba(248, 248, 246, 0.96);
  box-shadow: 0 18rpx 34rpx rgba(31, 35, 41, 0.06);
}

.product-card.without-image {
  padding-top: 0;
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

.product-card--home .product-cover {
  height: 286rpx;
  background: #e8e8e7;
}

.product-card--home .product-cover-shadow {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.06) 100%);
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

.product-card--home .product-condition {
  top: 16rpx;
  bottom: auto;
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(215, 110, 98, 0.2);
  color: #c0554f;
  font-size: 18rpx;
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
  z-index: 2;
  box-shadow: 0 8rpx 16rpx rgba(44, 62, 80, 0.08);
}

.product-card--home .product-favorite {
  width: 58rpx;
  height: 58rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #8c9199;
  box-shadow: 0 10rpx 18rpx rgba(31, 35, 41, 0.08);
}

.product-body {
  padding: 20rpx;
}

.product-card--home .product-body {
  padding: 22rpx 20rpx 24rpx;
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

.product-card--home .product-title {
  min-height: 72rpx;
  font-size: 28rpx;
  line-height: 1.55;
  color: #3a3f46;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.product-card--home .product-price-row {
  margin-bottom: 14rpx;
}

.product-price {
  font-size: 34rpx;
}

.product-card--home .product-price {
  color: #c0554f;
  font-weight: 600;
}

.product-origin {
  font-size: 20rpx;
  color: #adb5bd;
  text-decoration: line-through;
}

.product-card--home .product-origin {
  color: #afb4bc;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  font-size: 20rpx;
  color: #6c757d;
}

.product-card--home .product-meta {
  color: #8e949d;
}

.product-seller {
  max-width: 120rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-card--home .product-seller {
  max-width: 132rpx;
}
</style>
