<template>
  <view class="page">
    <view class="title">商品详情</view>
    <view class="card">ID: {{ id }}</view>
    <view class="card">标题：{{ detail.title || '-' }}</view>
    <view class="card">价格：￥{{ detail.price || '-' }}</view>
  </view>
</template>

<script>
import { getGoodsDetail } from '../../api/goods'

export default {
  data() {
    return {
      id: '',
      detail: {}
    }
  },
  onLoad(options) {
    this.id = (options && options.id) || ''
    this.fetchDetail()
  },
  methods: {
    fetchDetail() {
      if (!this.id) return
      getGoodsDetail(this.id).then((res) => {
        if (res && res.code === 0) {
          this.detail = res.data || {}
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
.card {
  background: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}
</style>
