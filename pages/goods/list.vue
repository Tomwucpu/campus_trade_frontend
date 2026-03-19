<template>
  <view class="app-page list-page" :class="themeClass">
    <!-- 固定顶部搜索区 -->
    <view class="sticky-header app-card">
      <view class="search-box">
        <input
          v-model="keyword"
          placeholder="搜一搜商品..."
          class="nav-input"
          confirm-type="search"
          @confirm="fetchList"
        />
        <text class="search-btn-text" @click="fetchList">搜索</text>
      </view>
      <!-- 筛选Tab -->
      <view class="filter-tabs">
        <view class="tab-item" :class="{ active: quickFilter === 'all' }" @click="setFilter('all')">综合</view>
        <view class="tab-item" :class="{ active: quickFilter === 'latest' }" @click="setFilter('latest')">最新发布</view>
        <view class="tab-item" :class="{ active: quickFilter === 'cheap' }" @click="setFilter('cheap')">价格最低</view>
      </view>
    </view>

    <!-- 商品列表 - 双列布局 -->
    <scroll-view scroll-y class="goods-container">
      <view v-if="!displayList.length" class="empty-state">
        <text>暂无相关宝贝</text>
      </view>

      <view class="goods-grid">
        <view v-for="(item, index) in displayList" :key="item.id" class="grid-item app-card" @click="goDetail(item.id)">
          <!-- 模拟图片 -->
          <view class="item-pic" :class="{ odd: index % 2 !== 0 }">
            <text class="pic-tag">实拍</text>
          </view>
          
          <view class="item-content">
            <view class="item-title">{{ item.title }}</view>
            <view class="item-tags">
              <text class="tag">自提</text>
              <text class="tag outline">可小刀</text>
            </view>
            <view class="item-footer">
              <view class="price-row app-price">
                <text class="symbol">￥</text>{{ item.price }}
              </view>
              <view class="item-user">
                <view class="user-avatar-small"></view>
                <text class="user-name">同学{{ index + 1 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getGoodsList } from '../../api/goods'
import { getTheme, resolveThemeClass, applyNavigationTheme } from '../../utils/theme'

export default {
  data() {
    return {
      keyword: '',
      quickFilter: 'all',
      list: [],
      themeClass: resolveThemeClass(getTheme())
    }
  },
  computed: {
    displayList() {
      const data = [...this.list]
      if (this.quickFilter === 'cheap') {
        return data.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      }
      if (this.quickFilter === 'latest') {
        return data.reverse()
      }
      return data
    }
  },
  onShow() {
    this.syncTheme()
  },
  onLoad() {
    this.fetchList()
  },
  methods: {
    syncTheme() {
      const theme = getTheme()
      this.themeClass = resolveThemeClass(theme)
      applyNavigationTheme(theme)
    },
    setFilter(type) {
      this.quickFilter = type
    },
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
.list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

.sticky-header {
  padding: 20rpx 24rpx 0;
  z-index: 10;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--ink-bg);
  padding: 12rpx 20rpx;
  border-radius: 36rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid var(--ink-border);
}

.nav-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--ink-text);
}

.search-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--ink-text);
  padding-left: 20rpx;
}

.filter-tabs {
  display: flex;
  justify-content: space-around;
  padding-bottom: 20rpx;
}

.tab-item {
  font-size: 28rpx;
  color: var(--ink-subtext);
  padding: 10rpx 0;
  position: relative;
}

.tab-item.active {
  color: var(--ink-text);
  font-weight: 700;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30rpx;
  height: 4rpx;
  background: var(--ink-text);
  border-radius: 2rpx;
}

.goods-container {
  flex: 1;
  padding: 20rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding-bottom: 40rpx;
}

.grid-item {
  border-radius: 16rpx;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.item-pic {
  width: 100%;
  height: 300rpx;
  background: var(--ink-surface-alt);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 10rpx;
}
.item-pic.odd {
  background: var(--ink-border); /* 略微区别颜色 fake image */
  opacity: 0.3;
}

.pic-tag {
  font-size: 20rpx;
  background: rgba(0,0,0,0.5);
  color: #fff;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.item-content {
  padding: 16rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--ink-text);
  line-height: 1.4;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-tags {
  display: flex;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.tag {
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  border-radius: 4rpx;
}

.item-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-row {
  font-size: 34rpx;
  font-weight: 700;
  display: flex;
  align-items: baseline;
}
.symbol {
  font-size: 24rpx;
}

.item-user {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.user-avatar-small {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: var(--ink-border);
}

.user-name {
  font-size: 20rpx;
  color: var(--ink-subtext);
  max-width: 80rpx;
  overflow: hidden;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  color: var(--ink-subtext);
  margin-top: 100rpx;
  font-size: 28rpx;
}
</style>
