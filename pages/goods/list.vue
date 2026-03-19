<template>
  <view class="page">
    <input v-model="keyword" placeholder="搜索商品" class="input" confirm-type="search" @confirm="fetchList" />
    <button size="mini" @click="fetchList">搜索</button>

    <view v-for="item in list" :key="item.id" class="item" @click="goDetail(item.id)">
      <view class="name">{{ item.title }}</view>
      <view class="price">￥{{ item.price }}</view>
    </view>
  </view>
</template>

<script>
import { getGoodsList } from '../../api/goods'

export default {
  data() {
    return {
      keyword: '',
      list: []
    }
  },
  onLoad() {
    this.fetchList()
  },
  methods: {
    fetchList() {
      getGoodsList({ keyword: this.keyword, pageNum: 1, pageSize: 10 }).then((res) => {
        if (res && res.code === 0) {
          this.list = (res.data && res.data.records) || []
          return
        }
        uni.showToast({ title: (res && res.message) || '加载失败', icon: 'none' })
      }).catch(() => {
        uni.showToast({ title: '加载失败', icon: 'none' })
      })
    },
    goDetail(id) {
      uni.navigateTo({ url: '/pages/goods/detail?id=' + id })
    }
  }
}
</script>

<style scoped>
.page { padding: 24rpx; }
.input {
  background: #fff;
  padding: 16rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}
.item {
  background: #fff;
  border-radius: 8rpx;
  padding: 18rpx;
  margin-top: 12rpx;
}
.name { font-weight: 600; }
.price { color: #e43d33; margin-top: 8rpx; }
</style>
