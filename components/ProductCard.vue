<template>
  <view class="product-card market-card" @click="$emit('click')">
    <view v-if="goods.imageUrl" class="product-cover">
      <image class="product-image" :src="goods.imageUrl" mode="aspectFill"></image>
      <view class="product-cover-shadow"></view>
      <view class="product-condition">{{ goods.conditionLabel }}</view>
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
export default {
  emits: ['click'],
  props: {
    goods: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
.product-card {
  overflow: hidden;
  position: relative;
  border-radius: 26rpx;
  border: 1rpx solid rgba(235, 237, 240, 0.92);
  background: rgba(248, 248, 246, 0.96);
  box-shadow: 0 18rpx 34rpx rgba(31, 35, 41, 0.06);
}

.product-cover {
  position: relative;
  height: 286rpx;
  background: #e8e8e7;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-cover-shadow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.06) 100%);
}

.product-condition {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  bottom: auto;
  padding: 6rpx 14rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(215, 110, 98, 0.2);
  color: #c0554f;
  font-size: 18rpx;
}

.product-body {
  padding: 22rpx 20rpx 24rpx;
}

.product-title {
  min-height: 72rpx;
  font-size: 28rpx;
  line-height: 1.55;
  color: #3a3f46;
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
  margin-bottom: 14rpx;
}

.product-price {
  font-size: 34rpx;
  color: #c0554f;
  font-weight: 600;
}

.product-origin {
  font-size: 20rpx;
  color: #afb4bc;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  font-size: 20rpx;
  color: #8e949d;
}

.product-seller {
  max-width: 132rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
