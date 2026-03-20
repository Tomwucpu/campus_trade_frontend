<template>
  <view class="market-page home-page" :class="themeClass">
    <view class="home-hero safe-top">
      <view class="market-shell">
        <view class="hero-top">
          <view>
            <view class="hero-title">校园二手市集</view>
            <view class="hero-subtitle">让闲置流转起来，轻松完成校内交易。</view>
          </view>
          <view class="hero-message" @click="go('/pages/user/messages')">
            <text class="hero-message-icon">铃</text>
            <text v-if="unreadCount" class="hero-message-dot"></text>
          </view>
        </view>

        <view class="search-box">
          <text class="search-icon">⌕</text>
          <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索你想要的二手物品"
            confirm-type="search"
            @confirm="goSearch"
          />
          <view class="search-submit" @click="goSearch">搜索</view>
        </view>
      </view>
    </view>

    <view class="market-shell category-shell">
      <view class="market-card category-card">
        <view class="category-grid">
          <view
            v-for="item in categories"
            :key="item.id"
            class="category-item"
            @click="openCategory(item)"
          >
            <view class="category-icon">{{ item.icon }}</view>
            <text class="category-label">{{ item.shortName || item.name }}</text>
          </view>
        </view>
      </view>

      <view class="market-card recommend-card">
        <view class="market-row-head">
          <view class="head-main">
            <view class="head-icon orange">荐</view>
            <view>
              <view class="market-section-title">为你推荐</view>
              <view class="market-section-subtitle">优先展示最近发布和浏览热度更高的商品。</view>
            </view>
          </view>
          <view class="head-link" @click="shuffleRecommend">换一批</view>
        </view>

        <scroll-view scroll-x class="recommend-scroll" show-scrollbar="false">
          <view class="recommend-row">
            <view
              v-for="item in recommendGoods"
              :key="`recommend-${item.id}`"
              class="recommend-item"
            >
              <ProductCard :goods="item" @click="openDetail(item.id)" />
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="market-row-head latest-head">
        <view class="head-main">
          <view class="head-icon green">新</view>
          <view>
            <view class="market-section-title">最新发布</view>
            <view class="market-section-subtitle">支持直接浏览、收藏和进入详情页查看商品。</view>
          </view>
        </view>
        <view class="head-link" @click="go('/pages/goods/list')">查看更多</view>
      </view>

      <view class="goods-grid">
        <ProductCard
          v-for="item in latestGoods"
          :key="item.id"
          :goods="item"
          @click="openDetail(item.id)"
        />
      </view>
    </view>

    <AppTabBar active="home" />
  </view>
</template>

<script>
import { getGoodsList } from '../../api/goods'
import AppTabBar from '../../components/AppTabBar.vue'
import ProductCard from '../../components/ProductCard.vue'
import { useGoodsStore } from '../../store/goods'
import {
  getFallbackGoodsList,
  getHomeCategories,
  getUnreadMessageCount,
  normalizeGoodsItem,
  sortGoodsList
} from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    AppTabBar,
    ProductCard
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      goodsStore: useGoodsStore(),
      searchKeyword: '',
      categories: getHomeCategories(),
      goodsList: [],
      recommendOffset: 0,
      unreadCountValue: 0
    }
  },
  computed: {
    unreadCount() {
      return this.unreadCountValue
    },
    normalizedGoods() {
      const base = this.goodsList.length ? this.goodsList : getFallbackGoodsList()
      return sortGoodsList(base.map((item, index) => normalizeGoodsItem(item, index)), 'latest')
    },
    recommendGoods() {
      const list = this.normalizedGoods.slice(0)
      if (!list.length) {
        return []
      }
      const offset = this.recommendOffset % list.length
      return [...list.slice(offset), ...list.slice(0, offset)].slice(0, 3)
    },
    latestGoods() {
      return this.normalizedGoods.slice(0, 6)
    }
  },
  onLoad() {
    this.syncPageState()
    this.fetchHomeFeed()
  },
  onShow() {
    this.syncPageState()
  },
  methods: {
    syncPageState() {
      syncThemePage(this)
      const store = this.goodsStore.sync()
      this.searchKeyword = store.keyword
      this.unreadCountValue = getUnreadMessageCount()
    },
    fetchHomeFeed() {
      getGoodsList({
        pageNum: 1,
        pageSize: 20
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.goodsList = (res.data && res.data.records) || []
            return
          }
          this.goodsList = []
        })
        .catch(() => {
          this.goodsList = []
        })
    },
    shuffleRecommend() {
      this.recommendOffset += 1
    },
    openCategory(item) {
      this.goodsStore.setCategoryId(item.value || item.id || 'all')
      this.goodsStore.setKeyword('')
      uni.navigateTo({ url: '/pages/goods/list' })
    },
    openDetail(id) {
      this.goodsStore.setLastViewedId(id)
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    },
    goSearch() {
      this.goodsStore.setKeyword(this.searchKeyword)
      uni.navigateTo({ url: '/pages/goods/list' })
    },
    go(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.home-page {
  padding-bottom: 180rpx;
}

.home-hero {
  background: linear-gradient(135deg, #2d6a4f 0%, #1b5e20 100%);
  padding-bottom: 32rpx;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.hero-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.hero-subtitle {
  font-size: 24rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
}

.hero-message {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hero-message-icon {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
}

.hero-message-dot {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #f77f00;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 14rpx;
  height: 92rpx;
  padding: 0 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
}

.search-icon {
  font-size: 30rpx;
  color: #adb5bd;
}

.search-input {
  flex: 1;
  height: 92rpx;
  font-size: 26rpx;
  color: #2c3e50;
}

.search-submit {
  min-width: 110rpx;
  height: 64rpx;
  border-radius: 18rpx;
  background: #2d6a4f;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
}

.category-shell {
  margin-top: -22rpx;
}

.category-card,
.recommend-card {
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20rpx 10rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.category-icon {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
}

.category-label {
  font-size: 22rpx;
  color: #2c3e50;
}

.head-main {
  display: flex;
  align-items: center;
  gap: 18rpx;
  flex: 1;
}

.head-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.head-icon.orange {
  background: linear-gradient(135deg, #f77f00 0%, #ff9b2f 100%);
}

.head-icon.green {
  background: linear-gradient(135deg, #2d6a4f 0%, #1b5e20 100%);
}

.head-link {
  font-size: 22rpx;
  color: #2d6a4f;
  white-space: nowrap;
}

.recommend-scroll {
  width: 100%;
  white-space: nowrap;
}

.recommend-row {
  display: inline-flex;
  gap: 18rpx;
  padding-right: 16rpx;
}

.recommend-item {
  width: 280rpx;
}

.latest-head {
  margin-bottom: 20rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}
</style>
