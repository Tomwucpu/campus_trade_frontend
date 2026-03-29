<template>
  <view class="market-page goods-list-page" :class="themeClass">
    <view class="sticky-shell">
      <view class="market-shell safe-top">
        <view class="market-topbar list-topbar">
          <view class="market-back-btn" @click="goBack">
            <text class="market-back-symbol">‹</text>
          </view>
          <view class="search-wrap">
            <text class="search-icon">⌕</text>
            <input
              v-model="keyword"
              class="search-field"
              placeholder="搜索你想要的二手物品"
              confirm-type="search"
              @confirm="fetchList"
            />
          </view>
          <view class="filter-btn" :class="{ active: showFilter }" @click="showFilter = !showFilter">
            筛
          </view>
        </view>

        <scroll-view scroll-x class="sort-scroll" show-scrollbar="false">
          <view class="sort-row">
            <view
              v-for="item in sortOptions"
              :key="item.value"
              class="market-pill"
              :class="{ active: sortMode === item.value }"
              @click="selectSort(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="showFilter" class="market-shell filter-shell">
        <view class="market-card filter-card">
          <view class="filter-block">
            <view class="filter-title">商品类目</view>
            <view class="chip-wrap">
              <view
                v-for="item in categories"
                :key="item.id"
                class="market-pill small"
                :class="{ active: String(categoryId) === String(item.id || item.value) }"
                @click="categoryId = item.id || item.value"
              >
                {{ item.shortName || item.name }}
              </view>
            </view>
          </view>

          <view class="filter-block">
            <view class="filter-title">商品成色</view>
            <view class="chip-wrap">
              <view
                v-for="item in conditionChoices"
                :key="item"
                class="market-pill small"
                :class="{ active: selectedConditions.includes(item) }"
                @click="toggleCondition(item)"
              >
                {{ item }}
              </view>
            </view>
          </view>

          <view class="filter-block">
            <view class="filter-title">价格区间</view>
            <view class="price-row">
              <input v-model="minPrice" class="market-input price-input" type="digit" placeholder="最低价" />
              <text class="price-gap">-</text>
              <input v-model="maxPrice" class="market-input price-input" type="digit" placeholder="最高价" />
            </view>
          </view>

          <view class="filter-actions">
            <button class="market-secondary-btn filter-action" @click="resetFilters">重置</button>
            <button class="market-primary-btn filter-action" @click="applyFilters">确定</button>
          </view>
        </view>
      </view>
    </view>

    <view class="market-shell result-shell">
      <view class="result-tip">共找到 {{ displayList.length }} 件商品，可继续按价格、热度和成色筛选。</view>

      <EmptyState
        v-if="!displayList.length"
        variant="list"
        icon="bi bi-search"
        title="没有找到符合条件的商品"
        description="试试换个关键词，或者清空筛选条件后重新看看。"
        button-text="清空筛选"
        @action="resetFilters"
      />

      <view v-else class="goods-grid">
        <ProductCard
          v-for="item in displayList"
          :key="item.id"
          :goods="item"
          @click="openDetail(item.id)"
          @favorite-change="handleFavoriteChange"
        />
      </view>
    </view>
  </view>
</template>

<script>
import { getGoodsList } from '../../api/goods'
import EmptyState from '../../components/EmptyState.vue'
import ProductCard from '../../components/ProductCard.vue'
import { useGoodsStore } from '../../store/goods'
import {
  filterGoodsList,
  getConditionOptions,
  getDefaultCategoryList,
  normalizeGoodsItem,
  patchGoodsFavoriteState
} from '../../utils/market'
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
      goodsStore: useGoodsStore(),
      keyword: '',
      showFilter: false,
      sortMode: 'latest',
      categoryId: 'all',
      minPrice: '',
      maxPrice: '',
      selectedConditions: [],
      list: [],
      categories: [{ id: 'all', name: '全部', shortName: '全部' }, ...getDefaultCategoryList()],
      sortOptions: [
        { value: 'latest', label: '最新发布' },
        { value: 'price-low', label: '价格从低到高' },
        { value: 'price-high', label: '价格从高到低' },
        { value: 'hot', label: '热度优先' }
      ]
    }
  },
  computed: {
    conditionChoices() {
      return getConditionOptions().map((item) => item.label)
    },
    displayList() {
      const normalized = this.list.map((item, index) => normalizeGoodsItem(item, index))
      return filterGoodsList(normalized, {
        keyword: this.keyword,
        categoryId: this.categoryId,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        conditions: this.selectedConditions,
        sortMode: this.sortMode
      })
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
      this.categoryId = store.categoryId || 'all'
      this.minPrice = store.minPrice || ''
      this.maxPrice = store.maxPrice || ''
      this.sortMode = this.resolveSortMode(store.quickFilter)
    },
    resolveSortMode(value) {
      const map = {
        latest: 'latest',
        'price-asc': 'price-low',
        'price-desc': 'price-high',
        cheap: 'price-low',
        hot: 'hot'
      }
      return map[value] || 'latest'
    },
    persistQuery() {
      const reverseSort = {
        latest: 'latest',
        'price-low': 'price-asc',
        'price-high': 'price-desc',
        hot: 'hot'
      }
      this.goodsStore.applyListQuery({
        keyword: this.keyword,
        categoryId: this.categoryId,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        quickFilter: reverseSort[this.sortMode] || 'latest'
      })
    },
    fetchList() {
      this.persistQuery()
      getGoodsList({
        keyword: this.keyword || undefined,
        pageNum: 1,
        pageSize: 40
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
    selectSort(value) {
      this.sortMode = value
      this.persistQuery()
    },
    toggleCondition(label) {
      if (this.selectedConditions.includes(label)) {
        this.selectedConditions = this.selectedConditions.filter((item) => item !== label)
        return
      }
      this.selectedConditions = [...this.selectedConditions, label]
    },
    resetFilters() {
      this.goodsStore.resetFilters()
      this.keyword = ''
      this.categoryId = 'all'
      this.minPrice = ''
      this.maxPrice = ''
      this.selectedConditions = []
      this.sortMode = 'latest'
      this.showFilter = false
      this.fetchList()
    },
    applyFilters() {
      this.showFilter = false
      this.persistQuery()
    },
    handleFavoriteChange(payload) {
      if (!payload || !payload.id) {
        return
      }
      this.list = patchGoodsFavoriteState(this.list, payload.id, payload.value)
    },
    openDetail(id) {
      this.goodsStore.setLastViewedId(id)
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    },
    goBack() {
      uni.navigateBack({
        fail: () => {
          uni.reLaunch({ url: '/pages/index/index' })
        }
      })
    }
  }
}
</script>

<style scoped>
.goods-list-page {
  padding-bottom: 60rpx;
}

.sticky-shell {
  position: sticky;
  top: 0;
  z-index: 18;
  background: linear-gradient(180deg, rgba(255, 254, 249, 0.96) 0%, rgba(255, 254, 249, 0.92) 100%);
  backdrop-filter: blur(10rpx);
}

.list-topbar {
  margin-bottom: 18rpx;
}

.search-wrap {
  flex: 1;
  height: 76rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 22rpx;
}

.search-icon {
  color: #adb5bd;
  font-size: 28rpx;
}

.search-field {
  flex: 1;
  height: 76rpx;
  font-size: 25rpx;
  color: #2c3e50;
}

.filter-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2c3e50;
  font-size: 28rpx;
  font-weight: 700;
}

.filter-btn.active {
  background: #2d6a4f;
  color: #ffffff;
}

.sort-scroll {
  width: 100%;
  white-space: nowrap;
  padding-bottom: 16rpx;
}

.sort-row {
  display: inline-flex;
  gap: 12rpx;
  padding-right: 24rpx;
}

.filter-shell {
  padding-bottom: 16rpx;
}

.filter-card {
  padding: 24rpx;
}

.filter-block + .filter-block {
  margin-top: 24rpx;
}

.filter-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 14rpx;
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.market-pill.small {
  min-height: 54rpx;
  padding: 0 20rpx;
  font-size: 22rpx;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.price-input {
  flex: 1;
  min-width: 0;
}

.price-gap {
  color: #adb5bd;
  font-size: 28rpx;
}

.filter-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.filter-action {
  flex: 1;
}

.result-shell {
  padding-top: 24rpx;
}

.result-tip {
  font-size: 22rpx;
  line-height: 1.7;
  color: #6c757d;
  margin-bottom: 20rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}
</style>
