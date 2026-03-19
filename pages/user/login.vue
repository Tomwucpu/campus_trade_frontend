<template>
  <view class="page">
    <input v-model="form.username" placeholder="请输入用户名" class="input" />
    <input v-model="form.password" password placeholder="请输入密码" class="input" />
    <button type="primary" @click="handleLogin">登录</button>
  </view>
</template>

<script>
import { login } from '../../api/auth'

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    handleLogin() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请输入账号密码', icon: 'none' })
        return
      }
      login(this.form).then((res) => {
        if (res && res.code === 0 && res.data && res.data.token) {
          uni.setStorageSync('token', res.data.token)
          uni.showToast({ title: '登录成功' })
          uni.reLaunch({ url: '/pages/index/index' })
          return
        }
        uni.showToast({ title: (res && res.message) || '登录失败', icon: 'none' })
      }).catch(() => {
        uni.showToast({ title: '登录失败', icon: 'none' })
      })
    }
  }
}
</script>

<style scoped>
.page {
  padding: 24rpx;
}
.input {
  background: #fff;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  padding: 20rpx;
}
</style>
