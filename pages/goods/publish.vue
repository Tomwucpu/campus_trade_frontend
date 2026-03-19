<template>
  <view class="page">
    <input v-model="form.title" placeholder="商品标题" class="input" />
    <input v-model="form.price" placeholder="价格" type="digit" class="input" />
    <textarea v-model="form.description" placeholder="商品描述" class="textarea" />
    <button type="primary" @click="submit">提交（占位）</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        title: '',
        price: '',
        description: ''
      }
    }
  },
  methods: {
    submit() {
      if (!this.form.title || !this.form.price) {
        uni.showToast({ title: '请填写标题和价格', icon: 'none' })
        return
      }
      uni.showToast({ title: '发布接口待接入', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page { padding: 24rpx; }
.input {
  background: #fff;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  padding: 20rpx;
}
.textarea {
  background: #fff;
  border-radius: 8rpx;
  min-height: 180rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}
</style>
