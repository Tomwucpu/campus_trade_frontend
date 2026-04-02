<template>
  <view class="market-page home-page" :class="themeClass">
    <view class="market-shell safe-top home-shell">
      <view class="home-topbar">
        <view class="brand-copy">
          <view class="brand-line">
            <text class="brand-title">集市</text>
            <uni-icons class="brand-spark" type="star-filled" :size="12" color="#df9189"></uni-icons>
          </view>
          <view class="brand-subtitle">让闲置流转，校内交易更轻一点。</view>
        </view>

        <view class="hero-message" @click="go('/pages/user/messages')">
          <uni-icons class="hero-message-icon" type="notification" :size="20" color="#595f69"></uni-icons>
          <text v-if="unreadCountValue" class="hero-message-dot"></text>
        </view>
      </view>

      <view class="search-box">
        <uni-icons class="search-icon" type="search" :size="18" color="#a9adb6"></uni-icons>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="寻物探宝，搜索闲置好物..."
          confirm-type="search"
          @confirm="goSearch"
        />
        <view class="search-submit" @click="goSearch">搜索</view>
      </view>

      <CampusBindingWidget
        variant="entry"
        mode="preference"
        tone="home"
        :display-name="currentCampusName"
        @updated="handleCampusUpdated"
      />

      <view class="hero-banner" @click="go('/pages/goods/list')">
        <view class="hero-banner-pattern"></view>
        <view class="hero-banner-copy">
          <view class="hero-badge">旧物新生计划</view>
          <view class="hero-banner-title">旧物生辉</view>
          <view class="hero-banner-subtitle">让闲置流转，书卷常新</view>
        </view>

        <view class="hero-banner-footer">
          <view class="hero-stat">
            <text class="hero-stat-value">{{ homeGoodsCount }}</text>
            <text class="hero-stat-label">最新在售</text>
          </view>
          <view class="hero-entry">
            <text>去逛逛</text>
            <uni-icons class="hero-entry-arrow" type="arrow-right" :size="14" color="#ffffff"></uni-icons>
          </view>
        </view>
      </view>

      <view class="category-section">
        <view class="primary-category-row">
          <view
            v-for="item in categories"
            :key="`primary-${item.id}`"
            class="primary-category-item"
            @click="openCategory(item)"
          >
            <view class="primary-category-icon">
              <text class="primary-category-glyph">{{ item.iconGlyph }}</text>
            </view>
            <text class="primary-category-label">{{ item.shortName || item.name }}</text>
          </view>
        </view>
      </view>

      <view class="section-block">
        <view class="section-head">
          <view class="section-title-wrap">
            <view class="section-marker"></view>
            <view>
              <view class="section-title">精选</view>
              <view class="section-subtitle">基于最新上架内容，为你先挑一轮值得看的好物。</view>
            </view>
          </view>
          <view class="section-link" @click="shuffleRecommend">
            <text>换一批</text>
            <uni-icons class="section-link-arrow" type="arrow-right" :size="14" color="#9da2ab"></uni-icons>
          </view>
        </view>

        <scroll-view v-if="recommendGoods.length" scroll-x class="recommend-scroll" :show-scrollbar="false">
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

        <view v-else class="market-card empty-card">
          <EmptyState
            variant="home"
            icon="bi bi-box"
            title="暂无推荐商品"
            description="当前没有可展示的商品，接入后端数据后会在这里展示。"
          />
        </view>
      </view>

      <view class="section-block latest-section">
        <view class="section-head">
          <view class="section-title-wrap">
            <view class="section-marker accent"></view>
            <view>
              <view class="section-title">最新发布</view>
              <view class="section-subtitle">支持直接浏览、收藏，并进入详情页查看商品。</view>
            </view>
          </view>
          <view class="section-link" @click="go('/pages/goods/list')">
            <text>查看更多</text>
            <uni-icons class="section-link-arrow" type="arrow-right" :size="14" color="#9da2ab"></uni-icons>
          </view>
        </view>

        <view v-if="latestGoods.length" class="goods-grid">
          <ProductCard
            v-for="item in latestGoods"
            :key="item.id"
            :goods="item"
            @click="openDetail(item.id)"
          />
        </view>

        <view v-else class="market-card empty-card">
          <EmptyState
            variant="home"
            icon="bi bi-folder2-open"
            title="暂无商品"
            description="当前商品列表为空，后端服务可用后会自动显示最新发布内容。"
          />
        </view>
      </view>
    </view>

    <AppTabBar active="home" />
  </view>
</template>

<script>
import { getGoodsList } from '../../api/goods'
import { getUnreadMessageCount } from '../../api/message'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import AppTabBar from '../../components/AppTabBar.vue'
import CampusBindingWidget from '../../components/CampusBindingWidget.vue'
import EmptyState from '../../components/EmptyState.vue'
import ProductCard from '../../components/ProductCard.vue'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import {
  resolvePreferredCampusCode,
  resolvePreferredCampusDisplayName
} from '../../utils/campus'
import {
  normalizeGoodsItem,
  sortGoodsList
} from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

const GOODS_LIST_PAGE_URL = '/pages/goods/list'
const HOME_FEED_QUERY = Object.freeze({
  pageNum: 1,
  pageSize: 20
})
const HOME_RECOMMEND_LIMIT = 3
const HOME_LATEST_LIMIT = 6

function resolveGoodsRecords(response) {
  if (!response || response.code !== 0) {
    return []
  }

  const data = response.data || {}
  return Array.isArray(data.records) ? data.records : []
}

function resolveUnreadCountValue(response) {
  if (!response || response.code !== 0) {
    return 0
  }

  return Number(response.data || 0)
}

function buildHomeGoods(goodsList = [], preferredCampusCode = '') {
  return sortGoodsList(goodsList.map((item, index) => normalizeGoodsItem(item, index)), 'latest', preferredCampusCode)
}

function pickRecommendGoods(list = [], offset = 0, limit = HOME_RECOMMEND_LIMIT) {
  if (!list.length) {
    return []
  }

  const startIndex = offset % list.length
  return [...list.slice(startIndex), ...list.slice(0, startIndex)].slice(0, limit)
}

export default {
  components: {
    UniIcons,
    AppTabBar,
    CampusBindingWidget,
    EmptyState,
    ProductCard
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      goodsStore: useGoodsStore(),
      isLoggedInValue: false,
      campusProfile: {},
      guestPreferredCampusCode: '',
      searchKeyword: '',
      categories: [
        { id: 'all', value: 'all', name: '全部', shortName: '全部', iconGlyph: '\uF3F5' },
        { id: 1, value: 1, name: '数码电子', shortName: '数码', iconGlyph: '\uF220' },
        { id: 2, value: 2, name: '教材书籍', shortName: '书籍', iconGlyph: '\uF194' },
        { id: 6, value: 6, name: '其他', shortName: '其他', iconGlyph: '\uF685' }
      ],
      goodsList: [],
      recommendOffset: 0,
      unreadCountValue: 0
    }
  },
  computed: {
    preferredCampusCode() {
      return resolvePreferredCampusCode(this.guestPreferredCampusCode, this.campusProfile)
    },
    currentCampusName() {
      return resolvePreferredCampusDisplayName(this.guestPreferredCampusCode, this.campusProfile, '手动选择校区')
    },
    homeGoods() {
      return buildHomeGoods(this.goodsList, this.preferredCampusCode)
    },
    recommendGoods() {
      return pickRecommendGoods(this.homeGoods, this.recommendOffset)
    },
    latestGoods() {
      return this.homeGoods.slice(0, HOME_LATEST_LIMIT)
    },
    homeGoodsCount() {
      return this.homeGoods.length
    }
  },
  onLoad() {
    this.syncPageState()
    this.fetchHomeFeed()
  },
  onShow() {
    this.syncPageState()
    this.fetchHomeFeed()
  },
  methods: {
    syncCampusState() {
      const authStore = this.authStore.sync()
      this.isLoggedInValue = authStore.isLoggedIn()
      this.campusProfile = { ...(authStore.profile || {}) }
      this.guestPreferredCampusCode = this.goodsStore.sync().preferredCampusCode || ''
    },
    syncPageState() {
      syncThemePage(this)
      this.syncCampusState()
      this.searchKeyword = this.goodsStore.sync().keyword
      if (!this.isLoggedInValue) {
        this.unreadCountValue = 0
        return
      }
      this.fetchUnreadCount()
    },
    async fetchHomeFeed() {
      try {
        const response = await getGoodsList({
          ...HOME_FEED_QUERY,
          sortMode: 'latest',
          preferredCampusCode: this.preferredCampusCode || undefined
        })
        this.goodsList = resolveGoodsRecords(response)
      } catch (error) {
        this.goodsList = []
      }
    },
    async fetchUnreadCount() {
      try {
        const response = await getUnreadMessageCount()
        this.unreadCountValue = resolveUnreadCountValue(response)
      } catch (error) {
        this.unreadCountValue = 0
      }
    },
    shuffleRecommend() {
      this.recommendOffset += 1
    },
    async handleCampusUpdated() {
      this.syncCampusState()
      await this.fetchHomeFeed()
    },
    openCategory(item) {
      this.goodsStore.setCategoryId(item.value || item.id || 'all')
      this.goodsStore.setKeyword('')
      this.go(GOODS_LIST_PAGE_URL)
    },
    openDetail(id) {
      this.goodsStore.setLastViewedId(id)
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    },
    goSearch() {
      this.goodsStore.setKeyword(this.searchKeyword)
      this.go(GOODS_LIST_PAGE_URL)
    },
    go(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 196rpx;
  background: var(--campus-page-bg);
}

.home-shell {
  padding-bottom: 48rpx;
}

.home-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin-bottom: 26rpx;
}

.brand-copy {
  flex: 1;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.brand-title {
  font-size: 48rpx;
  line-height: 1.1;
  font-weight: 500;
  color: #2d2d2d;
  letter-spacing: 6rpx;
}

.brand-spark {
  transform: translateY(-8rpx);
  line-height: 1;
}

.brand-subtitle {
  font-size: 24rpx;
  line-height: 1.7;
  color: #8a8f98;
}

.hero-message {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  border: 1rpx solid rgba(214, 217, 222, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 18rpx 36rpx rgba(25, 31, 38, 0.06);
}

.hero-message-icon {
  line-height: 1;
}

.hero-message-dot {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #d95a5a;
  border: 3rpx solid #ffffff;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: 96rpx;
  padding: 10rpx 12rpx 10rpx 26rpx;
  background: rgba(242, 243, 245, 0.96);
  border-radius: 999rpx;
  box-shadow: inset 0 0 0 1rpx rgba(226, 228, 231, 0.8);
}

.search-icon {
  line-height: 1;
}

.search-input {
  flex: 1;
  height: 76rpx;
  font-size: 26rpx;
  color: #444a54;
}

.search-submit {
  min-width: 118rpx;
  height: 72rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: #232323;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.hero-banner {
  position: relative;
  overflow: hidden;
  margin-top: 28rpx;
  padding: 30rpx 30rpx 26rpx;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #efefee 0%, #d8d9dc 100%);
  box-shadow: 0 22rpx 42rpx rgba(35, 35, 35, 0.08);
}

.hero-banner-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(45deg, rgba(182, 183, 187, 0.52) 0, rgba(182, 183, 187, 0.52) 18rpx, transparent 18rpx, transparent 36rpx),
    repeating-linear-gradient(45deg, transparent 0, transparent 18rpx, rgba(182, 183, 187, 0.42) 18rpx, rgba(182, 183, 187, 0.42) 36rpx);
  background-position: 0 0, 18rpx 18rpx;
}

.hero-banner-copy,
.hero-banner-footer {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  height: 48rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #6a6f77;
  font-size: 20rpx;
  letter-spacing: 1rpx;
  margin-bottom: 24rpx;
}

.hero-banner-title {
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.18;
  color: #30343a;
  letter-spacing: 8rpx;
  margin-bottom: 8rpx;
}

.hero-banner-subtitle {
  font-size: 24rpx;
  line-height: 1.7;
  color: #5d646d;
}

.hero-banner-footer {
  margin-top: 34rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-stat {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  color: #3b4047;
}

.hero-stat-value {
  font-size: 42rpx;
  font-weight: 600;
}

.hero-stat-label {
  font-size: 22rpx;
  color: #7b8088;
}

.hero-entry {
  min-width: 148rpx;
  height: 66rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(35, 35, 35, 0.96);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.hero-entry-arrow {
  line-height: 1;
}

.category-section {
  margin-top: 38rpx;
}

.primary-category-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18rpx;
}

.primary-category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
}

.primary-category-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(250, 250, 249, 0.96);
  border: 1rpx solid rgba(234, 236, 238, 0.96);
  box-shadow: 0 16rpx 30rpx rgba(31, 35, 41, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary-category-glyph {
  font-family: "bootstrap-icons";
  font-size: 20px;
  line-height: 1;
  color: #8f949d;
}

.primary-category-label {
  font-size: 22rpx;
  color: #646a74;
}

.section-block {
  margin-top: 40rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.section-title-wrap {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.section-marker {
  width: 8rpx;
  height: 36rpx;
  border-radius: 999rpx;
  background: #a53d3d;
  margin-top: 6rpx;
}

.section-marker.accent {
  background: #2c2f34;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.25;
  color: #2f3339;
  margin-bottom: 8rpx;
}

.section-subtitle {
  font-size: 22rpx;
  line-height: 1.7;
  color: #8a8f98;
}

.section-link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #9da2ab;
  white-space: nowrap;
}

.section-link-arrow {
  line-height: 1;
}

.recommend-scroll {
  width: 100%;
  white-space: nowrap;
}

.recommend-row {
  display: inline-flex;
  gap: 20rpx;
  padding-right: 16rpx;
}

.recommend-item {
  width: 306rpx;
}

.latest-section {
  padding-bottom: 18rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
}

.empty-card {
  overflow: hidden;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid rgba(235, 237, 240, 0.9);
  box-shadow: 0 18rpx 34rpx rgba(31, 35, 41, 0.05);
}
</style>
