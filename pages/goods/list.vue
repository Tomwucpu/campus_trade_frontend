<template>
  <view class="app-page list-page" :class="themeClass">
    <view class="list-hero app-card">
      <view class="list-hero-top">
        <view>
          <view class="list-kicker">Ink Market Feed</view>
          <view class="list-title">市集长卷</view>
        </view>
        <view class="hero-refresh" @click="fetchList">重载</view>
      </view>

      <view class="search-box">
        <view class="search-mark">寻</view>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="输入关键词，找书、找数码、找生活小物"
          confirm-type="search"
          @confirm="fetchList"
        />
        <view class="search-submit" @click="fetchList">搜索</view>
      </view>

      <scroll-view scroll-x class="category-scroll" show-scrollbar="false">
        <view class="category-row">
          <view
            v-for="item in categoryOptions"
            :key="item.value"
            class="app-chip outline"
            :class="{ active: categoryId === item.value }"
            @click="setCategory(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>

      <view class="filter-row">
        <view
          v-for="item in sortOptions"
          :key="item.value"
          class="filter-tab"
          :class="{ active: quickFilter === item.value }"
          @click="setQuickFilter(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="result-bar">
      <view class="result-text">共整理 {{ displayList.length }} 件闲置，支持点击进入详情页。</view>
      <view class="result-reset" @click="resetFilters">重置筛选</view>
    </view>

    <view v-if="!displayList.length" class="app-empty app-card">
      没有找到符合条件的商品，试试切换频道或换个关键词。
    </view>

    <view v-else class="goods-grid">
      <view
        v-for="(item, index) in displayList"
        :key="item.id"
        class="goods-card app-card"
        @click="goDetail(item.id)"
      >
        <view class="goods-cover" :class="item.coverStyle">
          <view class="goods-cover-wash"></view>
          <view class="goods-stamp">{{ item.stampText }}</view>
          <view class="goods-cover-bottom">
            <text class="goods-cover-title">{{ item.title }}</text>
          </view>
        </view>

        <view class="goods-body">
          <view class="goods-title">{{ item.title }}</view>
          <view class="goods-tags">
            <text class="goods-tag">{{ item.categoryLabel }}</text>
            <text class="goods-tag">{{ item.conditionLabel }}</text>
          </view>
          <view class="goods-price-line">
            <view class="goods-price app-price">¥{{ item.priceText }}</view>
            <view class="goods-view">{{ item.glanceCount }} 浏览</view>
          </view>
          <view class="goods-user-line">
            <view class="user-dot"></view>
            <text class="goods-user">{{ item.sellerName }}</text>
            <text class="goods-sep">·</text>
            <text class="goods-user">{{ item.campusArea }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getGoodsList } from '../../api/goods'
import { useGoodsStore } from '../../store/goods'
import { getCategoryOptions, normalizeGoodsItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  data() {
    return {
      theme: 'light',
      themeClass: '',
      keyword: '',
      quickFilter: 'all',
      categoryId: 'all',
      list: [],
      goodsStore: useGoodsStore(),
      sortOptions: [
        { value: 'all', label: '综合' },
        { value: 'latest', label: '最新发布' },
        { value: 'cheap', label: '价格友好' }
      ]
    }
  },
  computed: {
    categoryOptions() {
      return getCategoryOptions()
    },
    displayList() {
      let cards = this.list.map((item, index) => normalizeGoodsItem(item, index))

      if (this.categoryId !== 'all') {
        const filtered = cards.filter((item) => {
          const categoryMap = {
            recommend: true,
            new: item.publishedAtText.includes('小时'),
            books: item.categoryLabel === '教材',
            digital: item.categoryLabel === '数码',
            life: item.categoryLabel === '生活'
          }
          return categoryMap[this.categoryId]
        })

        cards = filtered.length ? filtered : cards
      }

      if (this.quickFilter === 'cheap') {
        cards = cards.slice().sort((a, b) => Number(a.priceText) - Number(b.priceText))
      } else if (this.quickFilter === 'latest') {
        cards = cards.slice().reverse()
      }

      return cards
    }
  },
  onLoad() {
    this.syncPageState()
    this.fetchList()
  },
  onShow() {
    this.syncPageState()
  },
  methods: {
    syncPageState() {
      syncThemePage(this)
      const store = this.goodsStore.sync()
      this.keyword = store.keyword
      this.quickFilter = store.quickFilter || 'all'
      this.categoryId = store.categoryId || 'all'
    },
    setCategory(value) {
      this.categoryId = value
      this.goodsStore.setCategoryId(value)
    },
    setQuickFilter(value) {
      this.quickFilter = value
      this.goodsStore.setQuickFilter(value)
    },
    resetFilters() {
      this.goodsStore.resetFilters()
      this.syncPageState()
      this.fetchList()
    },
    fetchList() {
      this.goodsStore.applyListQuery({
        keyword: this.keyword,
        quickFilter: this.quickFilter,
        categoryId: this.categoryId
      })

      getGoodsList({
        keyword: this.keyword,
        pageNum: 1,
        pageSize: 20
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.list = (res.data && res.data.records) || []
            return
          }
          uni.showToast({ title: (res && res.message) || '商品加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '商品加载失败', icon: 'none' })
        })
    },
    goDetail(id) {
      this.goodsStore.setLastViewedId(id)
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    }
  }
}
</script>

<style scoped>
.list-page {
  padding-bottom: 40rpx;
}

.list-hero {
  padding: 28rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.list-hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 26rpx;
}

.list-kicker {
  font-size: 20rpx;
  letter-spacing: 5rpx;
  text-transform: uppercase;
  color: var(--ink-subtext);
  margin-bottom: 8rpx;
}

.list-title {
  font-family: var(--ink-font-title);
  font-size: 52rpx;
  color: var(--ink-text);
}

.hero-refresh {
  padding: 16rpx 26rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--ink-border-strong);
  font-size: 24rpx;
  color: var(--ink-text);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 16rpx 18rpx;
  border-radius: 999rpx;
  background: var(--ink-surface-strong);
  border: 1rpx solid var(--ink-border);
  margin-bottom: 22rpx;
}

.search-mark {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: var(--ink-accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 28rpx;
}

.search-input {
  flex: 1;
  height: 68rpx;
  font-size: 28rpx;
  color: var(--ink-text);
}

.search-submit {
  min-width: 120rpx;
  height: 66rpx;
  border-radius: 999rpx;
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
}

.category-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 18rpx;
}

.category-row {
  display: inline-flex;
  gap: 12rpx;
  padding-right: 32rpx;
}

.filter-row {
  display: flex;
  gap: 16rpx;
}

.filter-tab {
  flex: 1;
  height: 66rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--ink-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-subtext);
  font-size: 25rpx;
  background: rgba(255, 255, 255, 0.15);
}

.filter-tab.active {
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
  border-color: var(--ink-accent);
}

.result-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
  color: var(--ink-subtext);
}

.result-text {
  flex: 1;
  font-size: 23rpx;
  line-height: 1.7;
}

.result-reset {
  font-size: 24rpx;
  color: var(--ink-text);
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.goods-card {
  overflow: hidden;
}

.goods-cover {
  height: 240rpx;
  position: relative;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-cover-wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.22) 0, transparent 24%),
    radial-gradient(circle at 82% 36%, rgba(255, 255, 255, 0.18) 0, transparent 24%),
    linear-gradient(140deg, rgba(255, 255, 255, 0.1) 0, transparent 32%);
}

.tone-0 {
  background: linear-gradient(160deg, #28251f 0%, #4b4337 56%, #847764 100%);
}

.tone-1 {
  background: linear-gradient(160deg, #3e372c 0%, #79614a 56%, #bb9a74 100%);
}

.tone-2 {
  background: linear-gradient(160deg, #1c1c1c 0%, #4a4a4a 56%, #818181 100%);
}

.tone-3 {
  background: linear-gradient(160deg, #2a2019 0%, #614636 56%, #a97b5e 100%);
}

.tone-4 {
  background: linear-gradient(160deg, #303030 0%, #5b5245 56%, #999083 100%);
}

.goods-stamp,
.goods-cover-bottom {
  position: relative;
  z-index: 1;
}

.goods-stamp {
  align-self: flex-start;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(250, 226, 120, 0.95);
  color: #2e2618;
  font-size: 20rpx;
  font-weight: 700;
}

.goods-cover-bottom {
  color: #ffffff;
}

.goods-cover-title {
  font-size: 24rpx;
  line-height: 1.5;
}

.goods-body {
  padding: 20rpx;
}

.goods-title {
  font-size: 28rpx;
  line-height: 1.45;
  min-height: 82rpx;
  color: var(--ink-text);
  margin-bottom: 14rpx;
}

.goods-tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  margin-bottom: 14rpx;
}

.goods-tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  font-size: 20rpx;
}

.goods-price-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14rpx;
}

.goods-price {
  font-size: 38rpx;
}

.goods-view {
  font-size: 20rpx;
  color: var(--ink-subtext);
}

.goods-user-line {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: var(--ink-subtext);
  font-size: 20rpx;
}

.user-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: var(--ink-border-strong);
}

.goods-sep {
  opacity: 0.4;
}
</style>
