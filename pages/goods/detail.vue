<template>
  <view class="app-page detail-page" :class="themeClass">
    <!-- 顶部图片占位 -->
    <view class="detail-hero">
      <view class="img-box">
        <text>商品实拍图</text>
      </view>
    </view>

    <!-- 商品信息卡片 -->
    <view class="detail-card app-card">
      <view class="price-line">
        <view class="curr-price app-price"><text class="sym">￥</text>{{ detail.price || '-' }}</view>
        <view class="wants">10人想要 · 浏览502</view>
      </view>
      <view class="detail-title">{{ detail.title || '商品标题' }}</view>
      
      <view class="detail-desc">
        {{ detail.description || '卖家暂未填写描述内容，建议聊天咨询。' }}
      </view>
    </view>

    <!-- 卖家信息 -->
    <view class="seller-card app-card">
      <view class="seller-left">
        <view class="seller-avatar"></view>
        <view class="seller-info">
          <view class="s-name">某同学</view>
          <view class="s-meta">发布于 软件学院宿舍</view>
        </view>
      </view>
      <view class="seller-action">关注</view>
    </view>

    <view class="safety-tip">
      ⚠️ 校园交易提醒：交易前请确认商品状态，建议当面交易，切勿直接转账。
    </view>

    <!-- 底部固定操作栏 -->
    <view class="bottom-bar app-card">
      <view class="icon-btns">
        <view class="ibtn" @click="notReady('收藏')">
          <text>☆</text>
          <text class="ibin-txt">收藏</text>
        </view>
        <view class="ibtn" @click="notReady('留言')">
          <text>💬</text>
          <text class="ibin-txt">留言</text>
        </view>
      </view>
      <view class="action-btns">
        <button class="buy-btn" @click="notReady('我想要')">我想要</button>
      </view>
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
.detail-page {
  padding-bottom: 120rpx; /* 留出底部栏高度 */
}

.detail-hero {
  margin-bottom: 20rpx;
}

.img-box {
  width: 100%;
  height: 500rpx;
  background: var(--ink-surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-subtext);
}

.detail-card {
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
}

.price-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20rpx;
}

.curr-price {
  font-size: 48rpx;
  font-weight: 700;
}
.sym {
  font-size: 30rpx;
}

.wants {
  font-size: 22rpx;
  color: var(--ink-subtext);
  margin-bottom: 8rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 800;
  color: var(--ink-text);
  margin-bottom: 30rpx;
  line-height: 1.4;
}

.detail-desc {
  font-size: 28rpx;
  line-height: 1.8;
  color: var(--ink-text);
}

.seller-card {
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seller-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.seller-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: var(--ink-border);
}

.s-name {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink-text);
}

.s-meta {
  font-size: 22rpx;
  color: var(--ink-subtext);
}

.seller-action {
  font-size: 24rpx;
  padding: 10rpx 24rpx;
  background: var(--ink-surface-alt);
  border-radius: 20rpx;
  font-weight: 600;
  color: var(--ink-text);
}

.safety-tip {
  margin: 30rpx;
  font-size: 22rpx;
  color: var(--ink-accent);
  opacity: 0.8;
  text-align: center;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  justify-content: space-between;
  border-radius: 0;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
}

.icon-btns {
  display: flex;
  gap: 40rpx;
  padding-left: 20rpx;
}

.ibtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 32rpx;
}
.ibin-txt {
  font-size: 20rpx;
  color: var(--ink-subtext);
}

.action-btns {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.buy-btn {
  margin: 0;
  background: var(--ink-text);
  color: var(--ink-bg);
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 40rpx;
  padding: 0 60rpx;
  height: 76rpx;
  line-height: 76rpx;
}
</style>
