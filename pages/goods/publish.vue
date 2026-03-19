<template>
  <view class="app-page publish-page" :class="themeClass">
    <!-- 顶部操作栏 -->
    <view class="pub-header">
       <view class="close-btn" @click="goBack">取消</view>
       <button class="pub-btn" @click="submit">发布</button>
    </view>

    <!-- 文本输入区 -->
    <view class="input-area app-card">
      <textarea
        v-model="form.description"
        placeholder="描述一下宝贝的品牌型号、新旧程度、入手渠道和转手原因..."
        class="desc-input"
        placeholder-style="font-size: 30rpx; color: var(--ink-subtext);"
      />

      <!-- 图片占位 -->
      <view class="media-row">
        <view class="add-image-box">
          <text class="plus">+</text>
          <text class="add-txt">发图/视频</text>
        </view>
      </view>
    </view>

    <!-- 底部信息组 -->
    <view class="field-group app-card">
      <view class="field-row">
        <input v-model="form.title" placeholder="添加标题" class="simple-input title-input" />
      </view>
      <view class="field-row border-top">
        <view class="label">价格</view>
        <view class="price-input-wrap">
          <text class="currency">￥</text>
          <input v-model="form.price" placeholder="0.00" type="digit" class="simple-input price-input" />
        </view>
      </view>
      <view class="field-row border-top">
        <view class="label">发货方式</view>
        <view class="val">自提/面交 ></view>
      </view>
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
    goBack() {
      uni.navigateBack()
    },
    submit() {
      if (!this.form.title || !this.form.price) {
        uni.showToast({ title: '请完善标题和价格', icon: 'none' })
        return
      }
      uni.showToast({ title: '发布接口待接入', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.publish-page {
  padding-top: 20rpx;
}

.pub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 10rpx;
  margin-bottom: 20rpx;
}

.close-btn {
  font-size: 30rpx;
  color: var(--ink-text);
  padding: 20rpx;
}

.pub-btn {
  margin: 0;
  background: var(--ink-text);
  color: var(--ink-bg);
  border-radius: 30rpx;
  font-size: 28rpx;
  padding: 0 40rpx;
  height: 60rpx;
  line-height: 60rpx;
}

.input-area {
  padding: 30rpx;
  margin-bottom: 20rpx;
  min-height: 400rpx;
  display: flex;
  flex-direction: column;
}

.desc-input {
  width: 100%;
  height: 200rpx;
  font-size: 30rpx;
  line-height: 1.5;
  color: var(--ink-text);
  margin-bottom: 30rpx;
}

.media-row {
  display: flex;
  gap: 20rpx;
}

.add-image-box {
  width: 160rpx;
  height: 160rpx;
  background: var(--ink-surface-alt);
  border: 2rpx dashed var(--ink-border);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ink-subtext);
}

.plus {
  font-size: 50rpx;
  font-weight: 300;
  line-height: 1;
}

.add-txt {
  font-size: 22rpx;
  margin-top: 10rpx;
}

.field-group {
  padding: 0 30rpx;
}

.field-row {
  min-height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.border-top {
  border-top: 1rpx solid var(--ink-border);
}

.simple-input {
  flex: 1;
  font-size: 30rpx;
  color: var(--ink-text);
}

.title-input {
  font-weight: 700;
}

.label {
  font-size: 30rpx;
  color: var(--ink-text);
  width: 160rpx;
}

.val {
  font-size: 28rpx;
  color: var(--ink-subtext);
}

.price-input-wrap {
  display: flex;
  align-items: center;
  flex: 1;
}

.currency {
  font-size: 30rpx;
  color: var(--ink-accent);
  margin-right: 10rpx;
  font-weight: 700;
}

.price-input {
  color: var(--ink-accent);
  font-weight: 700;
  font-size: 34rpx;
}
</style>
