<template>
  <view class="page">
    <view class="title">个人中心</view>
    <button @click="logout">退出登录</button>
  </view>
</template>

<script>
export default {
  methods: {
    logout() {
      uni.removeStorageSync('token')
      uni.showToast({ title: '已退出' })
      uni.reLaunch({ url: '/pages/user/login' })
    }
  }
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.title {
  font-size: 34rpx;
  margin-bottom: 20rpx;
}
</style>
