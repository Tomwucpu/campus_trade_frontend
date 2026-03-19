<template>
  <view class="page">
    <view class="title">校园二手交易平台</view>
    <view class="card" @click="go('/pages/goods/list')">商品列表</view>
    <view class="card" @click="go('/pages/goods/publish')">发布商品</view>
    <view class="card" @click="go('/pages/order/list')">我的订单</view>
    <view class="card" @click="go('/pages/user/profile')">个人中心</view>
  </view>
</template>

<script>
export default {
  methods: {
    go(url) {
      uni.navigateTo({ url: url })
    }
  }
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.title {
  font-size: 40rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}
.card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
</style>
