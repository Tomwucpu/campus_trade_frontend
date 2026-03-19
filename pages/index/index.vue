<template>
  <view class="app-page home-page" :class="themeClass">
    <!-- 顶部导航与搜索 -->
    <view class="home-navbar">
      <view class="nav-title">水墨集市</view>
      <view class="search-bar app-card" @click="go('/pages/goods/list')">
        <text class="search-icon">🔍</text>
        <text class="search-hint">搜索好物...</text>
      </view>
    </view>

    <!-- 金刚区/快捷入口 -->
    <view class="category-grid">
      <view class="cat-item" @click="go('/pages/goods/list')">
        <view class="cat-icon app-card">
          <uni-icons type="shop" size="30" color="#333"></uni-icons>
        </view>
        <text class="cat-name">市集</text>
      </view>
      
      <!-- 新增消息入口 -->
      <view class="cat-item" @click="go('/pages/message/list')">
        <view class="cat-icon app-card">
          <uni-icons type="chatbubble" size="30" color="#333"></uni-icons>
        </view>
        <text class="cat-name">消息</text>
      </view>

      <view class="cat-item" @click="go('/pages/goods/publish')">
        <view class="cat-icon app-card solid">
          <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
        </view>
        <text class="cat-name">发布</text>
      </view>

      <view class="cat-item" @click="go('/pages/order/list')">
        <view class="cat-icon app-card">
          <uni-icons type="list" size="30" color="#333"></uni-icons>
        </view>
        <text class="cat-name">订单</text>
      </view>
      <view class="cat-item" @click="go('/pages/user/profile')">
        <view class="cat-icon app-card">
          <uni-icons type="person" size="30" color="#333"></uni-icons>
        </view>
        <text class="cat-name">我的</text>
      </view>
    </view>

    <!-- 营销/Banner区 -->
    <view class="hero-card app-card">
      <view class="hero-content">
        <view class="hero-left">
          <view class="hero-title">校园闲置流转</view>
          <view class="hero-sub">同校交易更放心，当面换好物</view>
        </view>
        <view class="hero-btn" @click="go('/pages/goods/list')">立即查看</view>
      </view>
    </view>

    <!-- 瀑布流推荐（静态模拟） -->
    <view class="section-header">
      <text class="section-title">猜你喜欢</text>
    </view>
    <view class="waterfall">
      <!-- 模拟卡片1 -->
      <view class="waterfall-item app-card" @click="go('/pages/goods/list')">
        <view class="wf-img-placeholder"></view>
        <view class="wf-info">
          <view class="wf-title">九成新机械键盘，宿舍神...</view>
          <view class="wf-bottom">
            <view class="wf-price app-price">￥129</view>
            <view class="wf-meta">1人想要</view>
          </view>
        </view>
      </view>
       <!-- 模拟卡片2 -->
      <view class="waterfall-item app-card" @click="go('/pages/goods/list')">
        <view class="wf-img-placeholder dark"></view>
        <view class="wf-info">
          <view class="wf-title">考研数学复习全书</view>
          <view class="wf-bottom">
            <view class="wf-price app-price">￥25</view>
            <view class="wf-meta">刚刚发布</view>
          </view>
        </view>
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
.home-page {
  /* 增加底部内边距，防止内容被底部悬浮栏遮挡 */
  padding-bottom: 240rpx;
}

.home-navbar {
  margin-bottom: 30rpx;
}

.nav-title {
  font-size: 40rpx;
  font-weight: 800;
  margin-bottom: 20rpx;
  padding: 0 10rpx;
  color: var(--ink-text);
}

.search-bar {
  border-radius: 40rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  color: var(--ink-subtext);
}

.search-icon {
  margin-right: 14rpx;
}

.category-grid {
  /* 修改为固定定位 */
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  
  display: flex;
  justify-content: space-between;
  /* 移除 margin-bottom */
  margin-bottom: 0;
  /* 调整 padding，缩小整体高度 */
  padding: 16rpx; /* 底部留出安全距离 */
  box-sizing: border-box;
  background-color: var(--ink-bg); /* 跟随主题背景 */
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05); /* 添加顶部阴影 */
  border-top: 1rpx solid var(--ink-border);
}

.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.cat-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 移除字体大小设置，改用组件size */
}

.cat-icon.solid {
  background: var(--ink-text);
  color: var(--ink-bg);
}

.cat-name {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--ink-text);
}

.hero-card {
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 8rpx;
}

.hero-sub {
  font-size: 22rpx;
  color: var(--ink-subtext);
}

.hero-btn {
  padding: 12rpx 28rpx;
  border: 2rpx solid var(--ink-text);
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--ink-text);
}

.section-header {
  padding: 0 10rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink-text);
}

.waterfall {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.waterfall-item {
  border-radius: 16rpx;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.wf-img-placeholder {
  width: 100%;
  height: 340rpx;
  background-color: var(--ink-border);
  opacity: 0.1;
}

.wf-img-placeholder.dark {
  opacity: 0.2;
}

.wf-info {
  padding: 16rpx;
}

.wf-title {
  font-size: 26rpx;
  color: var(--ink-text);
  font-weight: 600;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.wf-price {
  font-size: 32rpx;
}

.wf-meta {
  font-size: 20rpx;
  color: var(--ink-subtext);
}
</style>
