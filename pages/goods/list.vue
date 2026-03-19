<template>
  <view class="app-page" :class="themeClass">
    <view class="search-card app-card">
      <view class="search-head">闲置好物</view>
      <input
        v-model="keyword"
        placeholder="搜索商品名称 / 描述"
        class="app-input"
        confirm-type="search"
        @confirm="fetchList"
      />
      <view class="filter-row">
        <view class="app-tag" :class="{ active: quickFilter === 'all' }" @click="setFilter('all')">全部</view>
        <view class="app-tag" :class="{ active: quickFilter === 'latest' }" @click="setFilter('latest')">最新</view>
        <view class="app-tag" :class="{ active: quickFilter === 'cheap' }" @click="setFilter('cheap')">低价优先</view>
      </view>
      <button class="app-primary-btn search-btn" @click="fetchList">搜索</button>
    </view>

    <view v-if="!displayList.length" class="app-empty app-card">暂无商品，换个关键词试试</view>

    <view v-for="(item, index) in displayList" :key="item.id" class="goods-item app-card" @click="goDetail(item.id)">
      <view class="item-top">
        <view class="item-title">{{ item.title }}</view>
        <view class="item-price app-price">￥{{ item.price }}</view>
      </view>
      <view class="item-desc">{{ item.description || '卖家暂无补充描述' }}</view>
      <view class="item-meta">
        <text>#{{ item.id }}</text>
        <text>·</text>
        <text>{{ index + 1 }}号位</text>
        <text>·</text>
        <text>可议价</text>
      </view>
    </view>
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
.search-card {
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.search-head {
  font-size: 33rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 14rpx;
}

.filter-row {
  display: flex;
  gap: 10rpx;
  margin-top: 2rpx;
  margin-bottom: 14rpx;
}

.search-btn {
  margin-top: 4rpx;
}

.goods-item {
  padding: 20rpx;
  margin-bottom: 14rpx;
}

.goods-item:active {
  transform: scale(0.993);
}

.item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14rpx;
}

.item-title {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  line-height: 1.45;
  font-weight: 700;
  color: var(--ink-text);
}

.item-price {
  font-size: 30rpx;
}

.item-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: var(--ink-subtext);
}

.item-meta {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 22rpx;
  color: var(--ink-subtext);
}
</style>
