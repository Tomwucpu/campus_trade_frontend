<template>
  <view class="app-page" :class="themeClass">
    <view class="hero app-card">
      <view class="hero-top">校园闲置 · 水墨集市</view>
      <view class="hero-title">像逛咸鱼一样，轻松淘好物</view>
      <view class="hero-sub">同校交易更快更稳，支持浏览、发布、订单管理</view>
      <view class="hero-actions">
        <view class="hero-btn" @click="go('/pages/goods/list')">去逛逛</view>
        <view class="hero-btn solid" @click="go('/pages/goods/publish')">马上发布</view>
      </view>
    </view>

    <view class="section-title">快捷入口</view>
    <view class="grid">
      <view class="entry app-card" @click="go('/pages/goods/list')">
        <view class="entry-name">商品列表</view>
        <view class="entry-desc">最新闲置与低价好货</view>
      </view>
      <view class="entry app-card" @click="go('/pages/order/list')">
        <view class="entry-name">我的订单</view>
        <view class="entry-desc">查看状态与交易金额</view>
      </view>
      <view class="entry app-card" @click="go('/pages/goods/publish')">
        <view class="entry-name">发布商品</view>
        <view class="entry-desc">3步完成闲置上架</view>
      </view>
      <view class="entry app-card" @click="go('/pages/user/profile')">
        <view class="entry-name">个人中心</view>
        <view class="entry-desc">切换黑白主题与退出</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getTheme, resolveThemeClass, applyNavigationTheme } from '../../utils/theme'

export default {
  data() {
    return {
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
    go(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.hero {
  padding: 24rpx;
  margin-bottom: 22rpx;
}

.hero-top {
  font-size: 22rpx;
  color: var(--ink-subtext);
  margin-bottom: 12rpx;
}

.hero-title {
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
  color: var(--ink-text);
}

.hero-sub {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--ink-subtext);
}

.hero-actions {
  margin-top: 22rpx;
  display: flex;
  gap: 14rpx;
}

.hero-btn {
  flex: 1;
  height: 76rpx;
  border-radius: 14rpx;
  border: 1rpx solid var(--ink-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink-surface-alt);
  color: var(--ink-text);
  font-size: 27rpx;
  font-weight: 600;
}

.hero-btn.solid {
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
}

.hero-btn:active {
  transform: scale(0.992);
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 14rpx;
  color: var(--ink-text);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
}

.entry {
  padding: 20rpx;
  min-height: 142rpx;
}

.entry:active {
  transform: scale(0.993);
}

.entry-name {
  font-size: 29rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 8rpx;
}

.entry-desc {
  font-size: 22rpx;
  line-height: 1.5;
  color: var(--ink-subtext);
}
</style>
