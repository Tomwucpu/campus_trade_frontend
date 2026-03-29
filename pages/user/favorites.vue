<template>
  <view class="market-page favorites-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar" :class="{ 'topbar-ready': topbarReady }">
        <view class="topbar-left">
          <view class="market-back-btn back-btn-plain" hover-class="topbar-btn-hover" hover-stay-time="90" @click="goBack">
            <text class="market-back-symbol">‹</text>
          </view>
          <view class="market-page-title">我的收藏</view>
        </view>
        <view class="count-wrap" :class="{ 'count-pop': countPop }">
          <text class="count-tip">共{{ favoriteTotal }}件</text>
        </view>
      </view>
    </view>

    <view class="market-shell page-body">
      <EmptyState
        v-if="!displayList.length"
        variant="list"
        icon="bi bi-heart"
        title="还没有收藏商品"
        description="看到心仪的商品就点一下小心心，方便稍后回来看。"
        button-text="去逛逛"
        @action="goMarket"
      />

      <view v-else class="goods-grid" :class="{ ready: listAnimated }">
        <view
          v-for="(item, index) in displayList"
          :key="item.id"
          class="goods-item"
          :style="getItemStyle(index)"
        >
          <ProductCard :goods="item" @click="openDetail(item.id)" @favorite-change="refreshList" />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getFavoriteList } from '../../api/favorite'
import EmptyState from '../../components/EmptyState.vue'
import ProductCard from '../../components/ProductCard.vue'
import { useAuthStore } from '../../store/auth'
import { normalizeGoodsItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    EmptyState,
    ProductCard
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      list: [],
      favoriteTotal: 0,
      topbarReady: false,
      countPop: false,
      listAnimated: false,
      shouldStagger: false,
      topbarTimer: null,
      countTimer: null,
      listEntryTimer: null,
      listStaggerTimer: null
    }
  },
  computed: {
    displayList() {
      return this.list.map((item, index) => normalizeGoodsItem(item, index))
    }
  },
  watch: {
    favoriteTotal() {
      this.triggerCountPop()
    }
  },
  onLoad() {
    if (!this.ensureLogin()) {
      return
    }
    syncThemePage(this)
    this.fetchList()
  },
  onReady() {
    this.startTopbarEntry()
  },
  onShow() {
    syncThemePage(this)
    if (this.authStore.sync().isLoggedIn()) {
      this.fetchList()
    }
  },
  onUnload() {
    this.clearTimers()
  },
  methods: {
    startTopbarEntry() {
      clearTimeout(this.topbarTimer)
      this.topbarReady = false
      this.$nextTick(() => {
        this.topbarTimer = setTimeout(() => {
          this.topbarReady = true
          this.topbarTimer = null
        }, 26)
      })
    },
    triggerCountPop() {
      clearTimeout(this.countTimer)
      this.countPop = false
      this.$nextTick(() => {
        this.countPop = true
        this.countTimer = setTimeout(() => {
          this.countPop = false
          this.countTimer = null
        }, 280)
      })
    },
    triggerListEntry() {
      clearTimeout(this.listEntryTimer)
      clearTimeout(this.listStaggerTimer)
      this.listAnimated = false
      this.shouldStagger = Boolean(this.list.length)
      if (!this.list.length) {
        return
      }
      this.$nextTick(() => {
        this.listEntryTimer = setTimeout(() => {
          this.listAnimated = true
          this.listEntryTimer = null
          this.listStaggerTimer = setTimeout(() => {
            this.shouldStagger = false
            this.listStaggerTimer = null
          }, 720)
        }, 24)
      })
    },
    getItemStyle(index) {
      if (!this.shouldStagger || !this.listAnimated) {
        return {}
      }
      return {
        transitionDelay: `${Math.min(index, 7) * 55}ms`
      }
    },
    clearTimers() {
      clearTimeout(this.topbarTimer)
      clearTimeout(this.countTimer)
      clearTimeout(this.listEntryTimer)
      clearTimeout(this.listStaggerTimer)
      this.topbarTimer = null
      this.countTimer = null
      this.listEntryTimer = null
      this.listStaggerTimer = null
    },
    ensureLogin() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }
      uni.showToast({ title: '请先登录后查看收藏', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    fetchList() {
      getFavoriteList({
        pageNum: 1,
        pageSize: 50
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.list = (res.data && res.data.records) || []
            this.favoriteTotal = Number((res.data && res.data.total) || 0)
            this.triggerListEntry()
            return
          }
          this.list = []
          this.favoriteTotal = 0
          this.triggerListEntry()
        })
        .catch(() => {
          this.list = []
          this.favoriteTotal = 0
          this.triggerListEntry()
        })
    },
    refreshList(payload) {
      if (payload && payload.value === false) {
        this.list = this.list.filter((item) => String(item.id) !== String(payload.id))
        this.favoriteTotal = Math.max(0, this.favoriteTotal - 1)
        return
      }
      this.fetchList()
    },
    openDetail(id) {
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    },
    goMarket() {
      uni.reLaunch({ url: '/pages/index/index' })
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/user/profile' })
        }
      })
    }
  }
}
</script>

<style scoped>
.favorites-page {
  --topbar-border: rgba(196, 190, 181, 0.58);
  --topbar-title: #2b2720;
  --topbar-meta: #999284;
  background: linear-gradient(180deg, #f2f0e9 0%, #f6f4ef 280rpx, var(--campus-bg) 100%);
  padding-bottom: 60rpx;
}

.page-topbar {
  margin: 0 calc(var(--campus-page-padding) * -1) 18rpx;
  padding: 8rpx var(--campus-page-padding) 18rpx;
  border-bottom: 1rpx solid var(--topbar-border);
  background: linear-gradient(180deg, rgba(239, 237, 230, 0.96) 0%, rgba(239, 237, 230, 0.88) 100%);
  opacity: 0;
  transform: translateY(-14rpx);
  transition:
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 300ms ease;
}

.page-topbar.topbar-ready {
  opacity: 1;
  transform: translateY(0);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}

.back-btn-plain {
  width: 56rpx;
  height: 56rpx;
  background: transparent;
  border: none;
  box-shadow: none;
}

.topbar-btn-hover {
  transform: scale(0.9);
  opacity: 0.74;
}

.market-back-symbol {
  font-size: 40rpx;
  line-height: 1;
  color: var(--topbar-title);
  transform: translateX(-2rpx);
}

.market-page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--topbar-title);
  letter-spacing: 1rpx;
}

.count-wrap {
  min-width: 156rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.count-wrap.count-pop {
  animation: countPop 280ms cubic-bezier(0.25, 0.8, 0.25, 1);
}

.count-tip {
  font-size: 30rpx;
  color: var(--topbar-meta);
  letter-spacing: 1rpx;
}

.page-body {
  padding-top: 18rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.goods-item {
  opacity: 0;
  transform: translateY(16rpx) scale(0.99);
  transition:
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease;
}

.goods-grid.ready .goods-item {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes countPop {
  0% {
    transform: translateY(2rpx) scale(0.96);
    opacity: 0.72;
  }
  60% {
    transform: translateY(0) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-topbar,
  .goods-item {
    transition: none;
  }

  .count-wrap.count-pop {
    animation: none;
  }
}
</style>
