<template>
  <view class="page">
    <view class="title">我的订单</view>
    <button size="mini" @click="fetchList">刷新</button>

    <view v-for="item in list" :key="item.id" class="item">
      <view>订单号：{{ item.orderNo }}</view>
      <view>状态：{{ item.status }}</view>
      <view>金额：￥{{ item.totalAmount }}</view>
    </view>
  </view>
</template>

<script>
import { getOrderList } from '../../api/order'

export default {
  data() {
    return {
      list: []
    }
  },
  onLoad() {
    this.fetchList()
  },
  methods: {
    fetchList() {
      getOrderList({ pageNum: 1, pageSize: 10 }).then((res) => {
        if (res && res.code === 0) {
          this.list = (res.data && res.data.records) || []
          return
        }
        uni.showToast({ title: (res && res.message) || '加载失败', icon: 'none' })
      }).catch(() => {
        uni.showToast({ title: '加载失败', icon: 'none' })
      })
    }
  }
}
</script>

<style scoped>
.page { padding: 24rpx; }
.title { font-size: 34rpx; margin-bottom: 16rpx; }
.item {
  background: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-top: 12rpx;
}
</style>
