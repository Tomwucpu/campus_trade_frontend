<template>
  <view class="market-page favorites-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar">
        <view class="market-back-btn" @click="goBack">
          <text class="market-back-symbol">‹</text>
        </view>
        <view class="market-page-title">我的收藏</view>
        <view class="count-tip">{{ favoriteIds.length }}</view>
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
import { getGoodsList } from '../../api/goods'
import EmptyState from '../../components/EmptyState.vue'
import ProductCard from '../../components/ProductCard.vue'
import { getFavoriteGoodsIds, getFallbackGoodsList, normalizeGoodsItem } from '../../utils/market'
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
      list: [],
      favoriteIdsSnapshot: []
    }
  },
  computed: {
    favoriteIds() {
      return this.favoriteIdsSnapshot
    },
    displayList() {
      const base = (this.list.length ? this.list : getFallbackGoodsList()).map((item, index) => normalizeGoodsItem(item, index))
      return base.filter((item) => this.favoriteIds.includes(String(item.id)))
    }
  },
  onLoad() {
    syncThemePage(this)
    this.favoriteIdsSnapshot = getFavoriteGoodsIds()
    this.fetchList()
  },
  onShow() {
    syncThemePage(this)
    this.favoriteIdsSnapshot = getFavoriteGoodsIds()
    this.fetchList()
  },
  methods: {
    fetchList() {
      getGoodsList({
        pageNum: 1,
        pageSize: 50
      })
        .then((res) => {
          if (res && res.code === 0) {
            this.list = (res.data && res.data.records) || []
            return
          }
          this.list = []
        })
        .catch(() => {
          this.list = []
        })
    },
    refreshList() {
      this.favoriteIdsSnapshot = getFavoriteGoodsIds()
      this.list = this.list.slice()
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
