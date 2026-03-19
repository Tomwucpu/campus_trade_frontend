<template>
  <view class="app-page" :class="themeClass">
    <view class="head app-card">
      <view class="head-title">{{ detail.title || '商品详情' }}</view>
      <view class="head-price app-price">￥{{ detail.price || '-' }}</view>
      <view class="head-meta">编号 #{{ id || '-' }} · 同校当面交易优先</view>
    </view>

    <view class="section app-card">
      <view class="section-name">商品信息</view>
      <view class="line">
        <text class="line-label">商品ID</text>
        <text class="line-value">{{ id || '-' }}</text>
      </view>
      <view class="line">
        <text class="line-label">价格</text>
        <text class="line-value">￥{{ detail.price || '-' }}</text>
      </view>
    </view>

    <view class="section app-card">
      <view class="section-name">商品描述</view>
      <view class="desc">{{ detail.description || '卖家暂未填写描述内容。' }}</view>
    </view>

    <view class="section app-card">
      <view class="section-name">交易提示</view>
      <view class="tips">建议在校园公共区域当面交易，确认商品状态后再付款。</view>
    </view>

    <view class="action-row">
      <button class="app-secondary-btn" @click="notReady('收藏')">收藏</button>
      <button class="app-secondary-btn" @click="notReady('联系')">联系卖家</button>
      <button class="app-primary-btn" @click="notReady('下单')">立即下单</button>
    </view>
  </view>
</template>

<script>
import { getGoodsDetail } from '../../api/goods'
import { getTheme, resolveThemeClass, applyNavigationTheme } from '../../utils/theme'

export default {
  data() {
    return {
      id: '',
      detail: {},
      themeClass: resolveThemeClass(getTheme())
    }
  },
  onShow() {
    this.syncTheme()
  },
  onLoad(options) {
    this.id = (options && options.id) || ''
    this.fetchDetail()
  },
  methods: {
    syncTheme() {
      const theme = getTheme()
      this.themeClass = resolveThemeClass(theme)
      applyNavigationTheme(theme)
    },
    notReady(action) {
      uni.showToast({ title: action + '功能待接入', icon: 'none' })
    },
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
.head {
  padding: 22rpx;
  margin-bottom: 14rpx;
}

.head-title {
  font-size: 34rpx;
  line-height: 1.4;
  font-weight: 700;
  color: var(--ink-text);
}

.head-price {
  margin-top: 10rpx;
  font-size: 38rpx;
}

.head-meta {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--ink-subtext);
}

.section {
  padding: 20rpx;
  margin-bottom: 14rpx;
}

.section-name {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 14rpx;
}

.line {
  min-height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1rpx solid var(--ink-border);
}

.line:first-of-type {
  border-top: none;
}

.line-label {
  font-size: 24rpx;
  color: var(--ink-subtext);
}

.line-value {
  font-size: 25rpx;
  color: var(--ink-text);
  font-weight: 600;
}

.desc,
.tips {
  font-size: 25rpx;
  line-height: 1.7;
  color: var(--ink-subtext);
}

.action-row {
  margin-top: 6rpx;
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 10rpx;
}
</style>
