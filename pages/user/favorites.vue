<template>
  <view class="market-page favorites-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar">
        <view class="market-back-btn" @click="goBack">
          <text class="market-back-symbol">‹</text>
        </view>
        <view class="market-page-title">我的收藏</view>
        <view class="count-tip">{{ favoriteTotal }}</view>
      </view>
    </view>

    <view class="market-shell page-body">
      <EmptyState
        v-if="!displayList.length"
        icon="♥"
        title="还没有收藏商品"
        description="看到心仪的商品就点一下小心心，方便稍后回来看。"
        button-text="去逛逛"
        @action="goMarket"
      />

      <view v-else class="goods-grid">
        <ProductCard
          v-for="item in displayList"
          :key="item.id"
          :goods="item"
          @click="openDetail(item.id)"
          @favorite-change="refreshList"
        />
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
      favoriteTotal: 0
    }
  },
  computed: {
    displayList() {
      return this.list.map((item, index) => normalizeGoodsItem(item, index))
    }
  },
  onLoad() {
    if (!this.ensureLogin()) {
      return
    }
    syncThemePage(this)
    this.fetchList()
  },
  onShow() {
    syncThemePage(this)
    if (this.authStore.sync().isLoggedIn()) {
      this.fetchList()
    }
  },
  methods: {
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
            return
          }
          this.list = []
          this.favoriteTotal = 0
        })
        .catch(() => {
          this.list = []
          this.favoriteTotal = 0
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
  padding-bottom: 60rpx;
}

.page-topbar {
  margin-bottom: 18rpx;
}

.count-tip {
  min-width: 52rpx;
  height: 52rpx;
  border-radius: 18rpx;
  background: #e8f5e9;
  color: #2d6a4f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
}

.page-body {
  padding-top: 16rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}
</style>
