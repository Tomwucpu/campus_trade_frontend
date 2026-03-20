<template>
  <view class="app-page home-page" :class="themeClass">
    <view class="home-topbar">
      <view>
        <view class="brand-kicker">Campus Flea Ink</view>
        <view class="brand-title">水墨集市</view>
      </view>
      <view class="home-topnote">同校闲置流转</view>
    </view>

    <view class="search-shell app-card">
      <view class="search-mark">墨</view>
      <input
        v-model="searchKeyword"
        class="search-input"
        placeholder="搜一件顺手的闲置"
        confirm-type="search"
        @confirm="goSearch"
      />
      <view class="search-trigger" @click="goSearch">寻物</view>
    </view>

    <scroll-view scroll-x class="channel-scroll" show-scrollbar="false">
      <view class="channel-row">
        <view
          v-for="tab in feedTabs"
          :key="tab.value"
          class="channel-chip"
          :class="{ active: activeFeedTab === tab.value }"
          @click="selectFeedTab(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>
    </scroll-view>

    <view class="hero-panel app-card">
      <view class="hero-copy">
        <view class="hero-mark">墨痕慢市</view>
        <view class="hero-title">同校闲置，一笔一划都更安心</view>
        <view class="hero-text">
          参考瀑布流灵感做成水墨版首页，保留搜索、列表、详情、订单和个人中心入口，黑白主题随时切换。
        </view>
      </view>
      <view class="hero-side">
        <view class="hero-stamp">荐</view>
        <view class="hero-action" @click="go('/pages/goods/list')">进入市集</view>
      </view>
      <view class="hero-splash splash-a"></view>
      <view class="hero-splash splash-b"></view>
    </view>

    <view class="shortcut-grid">
      <view
        v-for="item in shortcuts"
        :key="item.label"
        class="shortcut-item app-card"
        @click="handleShortcut(item)"
      >
        <view class="shortcut-icon">{{ item.icon }}</view>
        <view class="shortcut-title">{{ item.label }}</view>
        <view class="shortcut-desc">{{ item.desc }}</view>
      </view>
    </view>

    <view class="app-section-head">
      <view>
        <view class="section-title">墨市推荐</view>
        <view class="app-subtitle">双列卡片保留商品跳转能力，视觉上更接近你给的参考图节奏。</view>
      </view>
      <view class="section-link" @click="go('/pages/goods/list')">全部好物</view>
    </view>

    <view class="feed-grid">
      <view
        v-for="(item) in displayCards"
        :key="item.cardKey"
        class="feed-card app-card"
        @click="openDetail(item.id)"
      >
        <view class="feed-cover" :class="item.coverStyle">
          <view class="feed-cover-wash"></view>
          <view class="feed-stamp">{{ item.stampText }}</view>
          <view class="feed-cover-tag">{{ item.categoryLabel }}</view>
          <view class="feed-cover-title">{{ item.title }}</view>
        </view>
        <view class="feed-body">
          <view class="feed-title">{{ item.title }}</view>
          <view class="feed-tags">
            <text v-for="badge in item.badges" :key="badge" class="feed-tag">{{ badge }}</text>
          </view>
          <view class="feed-meta">
            <view class="feed-price app-price">¥{{ item.priceText }}</view>
            <view class="feed-wish">{{ item.wishCount }} 人想要</view>
          </view>
          <view class="feed-user">
            <view class="avatar-dot"></view>
            <text class="feed-user-name">{{ item.sellerName }}</text>
            <text class="feed-user-sep">·</text>
            <text class="feed-user-name">{{ item.campusArea }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-dock app-card">
      <view class="dock-item active">
        <text class="dock-icon">墨</text>
        <text class="dock-label">首页</text>
      </view>
      <view class="dock-item" @click="go('/pages/goods/list')">
        <text class="dock-icon">市</text>
        <text class="dock-label">集市</text>
      </view>
      <view class="dock-publish" @click="go('/pages/goods/publish')">
        <text class="dock-publish-icon">+</text>
        <text class="dock-publish-label">发布</text>
      </view>
      <view class="dock-item" @click="go('/pages/order/list')">
        <text class="dock-icon">单</text>
        <text class="dock-label">订单</text>
      </view>
      <view class="dock-item" @click="go('/pages/user/profile')">
        <text class="dock-icon">我</text>
        <text class="dock-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getGoodsList } from '../../api/goods'
import { useGoodsStore } from '../../store/goods'
import { getCategoryOptions, normalizeGoodsItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

const fallbackShowcase = [
  { id: 201, title: '九成新机械键盘，宿舍静音轴', price: 168, categoryLabel: '数码' },
  { id: 202, title: '考研数学全程笔记，划线清晰', price: 35, categoryLabel: '教材' },
  { id: 203, title: '山地车头盔和夜骑灯一套', price: 88, categoryLabel: '代步' },
  { id: 204, title: '宿舍咖啡壶和磨豆罐组合', price: 76, categoryLabel: '生活' }
]

export default {
  data() {
    return {
      theme: 'light',
      themeClass: '',
      searchKeyword: '',
      activeFeedTab: 'recommend',
      remoteCards: [],
      goodsStore: useGoodsStore(),
      shortcuts: [
        { icon: '榜', label: '热门榜单', desc: '看看大家都在捡什么漏', path: '/pages/goods/list', feedTab: 'recommend' },
        { icon: '新', label: '最新发布', desc: '刚挂出的闲置更容易抢到', path: '/pages/goods/list', quickFilter: 'latest' },
        { icon: '单', label: '我的订单', desc: '查看交易进度与记录', path: '/pages/order/list' },
        { icon: '人', label: '个人中心', desc: '切主题、看资料、退出登录', path: '/pages/user/profile' }
      ]
    }
  },
  computed: {
    feedTabs() {
      return getCategoryOptions().filter((item) => item.value !== 'all')
    },
    displayCards() {
      const source = this.remoteCards.length ? this.remoteCards : fallbackShowcase
      const cards = source
        .map((item, index) => normalizeGoodsItem(item, index))
        .map((item, index) => ({
          ...item,
          cardKey: `${item.id}-${index}`
        }))

      if (this.activeFeedTab === 'recommend') {
        return cards
      }

      const filtered = cards.filter((item) => {
        if (this.activeFeedTab === 'new') {
          return indexGuard(item.publishedAtText)
        }
        if (this.activeFeedTab === 'books') {
          return item.categoryLabel === '教材'
        }
        if (this.activeFeedTab === 'digital') {
          return item.categoryLabel === '数码'
        }
        if (this.activeFeedTab === 'life') {
          return item.categoryLabel === '生活'
        }
        return true
      })

      return filtered.length ? filtered : cards
    }
  },
  onLoad() {
    this.syncState()
    this.fetchHomeFeed()
  },
  onShow() {
    this.syncState()
  },
  methods: {
    syncState() {
      syncThemePage(this)
      const store = this.goodsStore.sync()
      this.searchKeyword = store.keyword
      this.activeFeedTab = store.feedTab || 'recommend'
    },
    selectFeedTab(tab) {
      this.activeFeedTab = tab
      this.goodsStore.setFeedTab(tab)
    },
    handleShortcut(item) {
      if (item.feedTab) {
        this.goodsStore.setFeedTab(item.feedTab)
      }
      if (item.quickFilter) {
        this.goodsStore.setQuickFilter(item.quickFilter)
      }
      this.go(item.path)
    },
    goSearch() {
      this.goodsStore.setKeyword(this.searchKeyword)
      this.goodsStore.setFeedTab(this.activeFeedTab)
      uni.navigateTo({ url: '/pages/goods/list' })
    },
    fetchHomeFeed() {
      getGoodsList({
        pageNum: 1,
        pageSize: 6,
        keyword: this.searchKeyword || undefined
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.remoteCards = (res.data && res.data.records) || []
            return
          }
          uni.showToast({ title: (res && res.message) || '首页数据加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '首页数据加载失败', icon: 'none' })
        })
    },
    openDetail(id) {
      this.goodsStore.setLastViewedId(id)
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    },
    go(url) {
      uni.navigateTo({ url })
    }
  }
}

function indexGuard(text) {
  return typeof text === 'string' && text.includes('小时')
}
</script>

<style scoped>
.home-page {
  padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
}

.home-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 26rpx;
  position: relative;
  z-index: 1;
}

.brand-kicker {
  font-size: 20rpx;
  letter-spacing: 5rpx;
  text-transform: uppercase;
  color: var(--ink-subtext);
  margin-bottom: 10rpx;
}

.brand-title {
  font-family: var(--ink-font-title);
  font-size: 58rpx;
  font-weight: 700;
  color: var(--ink-text);
  letter-spacing: 4rpx;
}

.home-topnote {
  padding: 16rpx 24rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--ink-border);
  background: rgba(255, 255, 255, 0.18);
  color: var(--ink-subtext);
  font-size: 22rpx;
  line-height: 1;
  margin-top: 10rpx;
}

.search-shell {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 18rpx 20rpx;
  border-radius: 999rpx;
  margin-bottom: 22rpx;
  position: relative;
  z-index: 1;
}

.search-mark {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 1rpx solid var(--ink-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 34rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  color: var(--ink-text);
  font-size: 30rpx;
}

.search-trigger {
  min-width: 132rpx;
  height: 72rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
  font-size: 28rpx;
  font-weight: 600;
}

.channel-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;
}

.channel-row {
  display: inline-flex;
  gap: 16rpx;
  padding-right: 40rpx;
}

.channel-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 124rpx;
  height: 62rpx;
  border-radius: 999rpx;
  font-size: 25rpx;
  color: var(--ink-subtext);
  border: 1rpx solid var(--ink-border);
  background: rgba(255, 255, 255, 0.22);
}

.channel-chip.active {
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
  border-color: var(--ink-accent);
}

.hero-panel {
  overflow: hidden;
  padding: 32rpx;
  margin-bottom: 26rpx;
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  position: relative;
  z-index: 1;
}

.hero-copy,
.hero-side {
  position: relative;
  z-index: 1;
}

.hero-copy {
  flex: 1;
}

.hero-mark {
  font-size: 22rpx;
  color: var(--ink-subtext);
  letter-spacing: 8rpx;
  margin-bottom: 18rpx;
}

.hero-title {
  font-family: var(--ink-font-title);
  font-size: 46rpx;
  line-height: 1.28;
  color: var(--ink-text);
  margin-bottom: 20rpx;
}

.hero-text {
  font-size: 24rpx;
  line-height: 1.8;
  color: var(--ink-subtext);
  max-width: 420rpx;
}

.hero-side {
  width: 180rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.hero-stamp {
  width: 98rpx;
  height: 98rpx;
  border-radius: 50%;
  border: 3rpx solid var(--ink-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 40rpx;
}

.hero-action {
  padding: 18rpx 28rpx;
  border-radius: 999rpx;
  border: 1rpx solid var(--ink-border-strong);
  color: var(--ink-text);
  font-size: 24rpx;
}

.hero-splash {
  position: absolute;
  border-radius: 50%;
  filter: blur(6rpx);
}

.splash-a {
  width: 260rpx;
  height: 160rpx;
  right: -60rpx;
  top: -20rpx;
  background: rgba(0, 0, 0, 0.08);
}

.theme-dark .splash-a {
  background: rgba(255, 255, 255, 0.08);
}

.splash-b {
  width: 240rpx;
  height: 160rpx;
  left: 220rpx;
  bottom: -80rpx;
  background: rgba(0, 0, 0, 0.05);
}

.theme-dark .splash-b {
  background: rgba(255, 255, 255, 0.06);
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  margin-bottom: 34rpx;
  position: relative;
  z-index: 1;
}

.shortcut-item {
  padding: 24rpx;
  min-height: 176rpx;
}

.shortcut-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  background: var(--ink-accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.shortcut-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 10rpx;
}

.shortcut-desc {
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--ink-subtext);
}

.section-title {
  font-family: var(--ink-font-title);
  font-size: 40rpx;
  color: var(--ink-text);
  margin-bottom: 8rpx;
}

.section-link {
  font-size: 24rpx;
  color: var(--ink-subtext);
  padding-left: 24rpx;
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  position: relative;
  z-index: 1;
}

.feed-card {
  overflow: hidden;
}

.feed-cover {
  height: 264rpx;
  padding: 22rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-bottom: 1rpx solid var(--ink-border);
}

.feed-cover::before {
  content: '';
  position: absolute;
  inset: 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.26);
  border-radius: 18rpx;
  opacity: 0.9;
}

.feed-cover-wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.26) 0, transparent 24%),
    radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.18) 0, transparent 26%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0, transparent 35%);
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

.feed-stamp,
.feed-cover-tag,
.feed-cover-title {
  position: relative;
  z-index: 1;
}

.feed-stamp {
  width: 86rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: rgba(250, 226, 120, 0.95);
  color: #2e2618;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
}

.feed-cover-tag {
  align-self: flex-start;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  color: #ffffff;
  font-size: 22rpx;
  margin-top: auto;
}

.feed-cover-title {
  color: #ffffff;
  font-size: 26rpx;
  line-height: 1.5;
  max-width: 270rpx;
}

.feed-body {
  padding: 22rpx;
}

.feed-title {
  color: var(--ink-text);
  font-size: 30rpx;
  line-height: 1.45;
  min-height: 84rpx;
  margin-bottom: 14rpx;
}

.feed-tags {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.feed-tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  color: var(--ink-subtext);
  background: var(--ink-tag-bg);
}

.feed-meta {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.feed-price {
  font-size: 40rpx;
}

.feed-wish {
  font-size: 20rpx;
  color: var(--ink-subtext);
}

.feed-user {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: var(--ink-subtext);
  font-size: 20rpx;
}

.avatar-dot {
  width: 26rpx;
  height: 26rpx;
  border-radius: 50%;
  background: var(--ink-border-strong);
}

.feed-user-sep {
  opacity: 0.5;
}

.bottom-dock {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(18rpx + env(safe-area-inset-bottom));
  min-height: 120rpx;
  padding: 18rpx 20rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  z-index: 5;
}

.dock-item {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  color: var(--ink-subtext);
}

.dock-item.active {
  color: var(--ink-text);
}

.dock-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ink-font-title);
  font-size: 30rpx;
  background: var(--ink-accent-soft);
}

.dock-label {
  font-size: 22rpx;
}

.dock-publish {
  width: 164rpx;
  height: 164rpx;
  margin-top: -56rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #fae35c 0%, #f3c91d 100%);
  border: 12rpx solid rgba(245, 241, 232, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #171512;
  box-shadow: 0 18rpx 44rpx rgba(69, 58, 28, 0.18);
}

.theme-dark .dock-publish {
  border-color: rgba(16, 16, 16, 0.9);
}

.dock-publish-icon {
  font-size: 48rpx;
  line-height: 1;
}

.dock-publish-label {
  font-size: 24rpx;
  font-weight: 700;
}
</style>
