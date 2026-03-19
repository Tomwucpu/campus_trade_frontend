<template>
  <view class="app-page" :class="themeClass">
    <view class="publish-head app-card">
      <view class="publish-title">发布商品</view>
      <view class="publish-sub">参考咸鱼发布逻辑，先填核心信息再完善细节</view>
    </view>

    <view class="publish-card app-card">
      <view class="group-title">基础信息</view>
      <input v-model="form.title" placeholder="商品标题" class="app-input" />
      <input v-model="form.price" placeholder="价格（元）" type="digit" class="app-input" />

      <view class="group-title second">商品描述</view>
      <textarea
        v-model="form.description"
        placeholder="商品描述（新旧程度、交易方式、取货地点）"
        class="app-textarea"
      />

      <button class="app-primary-btn submit-btn" @click="submit">提交（占位）</button>
    </view>
  </view>
</template>

<script>
import { getTheme, resolveThemeClass, applyNavigationTheme } from '../../utils/theme'

export default {
  data() {
    return {
      form: {
        title: '',
        price: '',
        description: ''
      },
      themeClass: resolveThemeClass(getTheme())
    }
  },
  onShow() {
    this.syncTheme()
  },
  methods: {
    syncTheme() {
      const theme = getTheme()
      this.themeClass = resolveThemeClass(theme)
      applyNavigationTheme(theme)
    },
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
.publish-head {
  padding: 20rpx;
  margin-bottom: 14rpx;
}

.publish-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--ink-text);
}

.publish-sub {
  margin-top: 8rpx;
  color: var(--ink-subtext);
  font-size: 23rpx;
}

.publish-card {
  padding: 20rpx;
}

.group-title {
  font-size: 25rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 10rpx;
}

.group-title.second {
  margin-top: 8rpx;
}

.app-input {
  margin-bottom: 14rpx;
}

.submit-btn {
  margin-top: 2rpx;
}
</style>
