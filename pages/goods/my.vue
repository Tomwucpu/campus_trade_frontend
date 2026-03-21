<template>
  <view class="market-page my-goods-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar page-topbar">
        <view class="market-back-btn" @click="goBack">
          <text class="market-back-symbol">‹</text>
        </view>
        <view class="market-page-title">我的发布</view>
        <view class="market-icon-btn placeholder-btn"></view>
      </view>

      <scroll-view scroll-x class="tab-scroll" show-scrollbar="false">
        <view class="tab-row">
          <view
            v-for="item in tabs"
            :key="item.value"
            class="tab-item"
            :class="{ active: activeTab === item.value }"
            @click="setActiveTab(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="market-shell page-body">
      <EmptyState
        v-if="!displayList.length"
        icon="🗂"
        title="当前状态下还没有商品"
        description="你可以继续发布新的闲置，或者切换到其他状态标签查看。"
        button-text="去发布"
        @action="goPublish"
      />

      <view v-else class="goods-list">
        <view v-for="item in displayList" :key="item.id" class="market-card goods-card" @click="openDetail(item.id)">
          <view class="goods-row">
            <image class="goods-image" :src="item.imageUrl" mode="aspectFill"></image>
            <view class="goods-main">
              <view class="goods-title">{{ item.title }}</view>
              <view class="goods-price market-price">¥{{ item.priceText }}</view>
              <view class="goods-meta">发布于 {{ item.createdAtText }} · 浏览 {{ item.viewCount }}</view>
            </view>
            <StatusTag :status="statusText(item.status)" :type="statusType(item.status)" />
          </view>

          <view class="goods-actions">
            <button
              v-if="canEdit(item)"
              class="market-secondary-btn action-btn"
              @click.stop="editGoods(item.id)"
            >
              编辑商品
            </button>
            <button
              v-if="item.status === 'ON_SALE'"
              class="market-primary-btn action-btn"
              @click.stop="changeStatus(item, 'OFFLINE')"
            >
              下架商品
            </button>
            <button
              v-else-if="item.status === 'OFFLINE'"
              class="market-primary-btn action-btn"
              @click.stop="changeStatus(item, 'ON_SALE')"
            >
              重新上架
            </button>
            <button
              v-else
              class="market-secondary-btn action-btn"
              @click.stop="openDetail(item.id)"
            >
              查看详情
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyGoodsList, offSaleGoods, onSaleGoods } from '../../api/goods'
import EmptyState from '../../components/EmptyState.vue'
import StatusTag from '../../components/StatusTag.vue'
import { useAuthStore } from '../../store/auth'
import { normalizeGoodsItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    EmptyState,
    StatusTag
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      activeTab: 'ON_SALE',
      list: [],
      tabs: [
        { value: 'PENDING', label: '待审核' },
        { value: 'ON_SALE', label: '在售中' },
        { value: 'SOLD', label: '已售出' },
        { value: 'OFFLINE', label: '已下架' }
      ]
    }
  },
  computed: {
    displayList() {
      return this.list
        .map((item, index) => normalizeGoodsItem(item, index))
        .filter((item) => item.status === this.activeTab)
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
      uni.showToast({ title: '请先登录后查看我的发布', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    setActiveTab(value) {
      if (this.activeTab === value) {
        return
      }
      this.activeTab = value
      this.fetchList()
    },
    fetchList() {
      getMyGoodsList({
        pageNum: 1,
        pageSize: 50,
        status: this.activeTab
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
    canEdit(item) {
      return item.status !== 'SOLD'
    },
    statusText(status) {
      if (status === 'ON_SALE') {
        return '在售中'
      }
      if (status === 'OFFLINE') {
        return '已下架'
      }
      if (status === 'SOLD') {
        return '已售出'
      }
      return '待审核'
    },
    statusType(status) {
      if (status === 'ON_SALE') {
        return 'success'
      }
      if (status === 'OFFLINE') {
        return 'error'
      }
      if (status === 'SOLD') {
        return 'default'
      }
      return 'warning'
    },
    openDetail(id) {
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    },
    editGoods(id) {
      uni.navigateTo({ url: `/pages/goods/publish?id=${id}` })
    },
    changeStatus(item, nextStatus) {
      const action = nextStatus === 'ON_SALE' ? () => onSaleGoods(item.id) : () => offSaleGoods(item.id)
      const title = nextStatus === 'ON_SALE' ? '商品已重新上架' : '商品已下架'

      action()
        .then((res) => {
          if (res && res.code === 0) {
            uni.showToast({ title: res.message || title, icon: 'success' })
            this.fetchList()
            return
          }
          uni.showToast({ title: (res && res.message) || '操作失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '操作失败', icon: 'none' })
        })
    },
    goPublish() {
      uni.navigateTo({ url: '/pages/goods/publish' })
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
.my-goods-page {
  padding-bottom: 60rpx;
}

.page-topbar {
  margin-bottom: 22rpx;
}

.placeholder-btn {
  opacity: 0;
}

.tab-scroll {
  width: 100%;
  white-space: nowrap;
  padding-bottom: 12rpx;
}

.tab-row {
  display: inline-flex;
  gap: 14rpx;
  padding-right: 24rpx;
}

.tab-item {
  min-height: 60rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f8f9fa;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
}

.tab-item.active {
  background: #2d6a4f;
  color: #ffffff;
}

.page-body {
  padding-top: 24rpx;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.goods-card {
  padding: 22rpx;
}

.goods-row {
  display: flex;
  gap: 18rpx;
  align-items: center;
}

.goods-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 18rpx;
}

.goods-image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  flex-shrink: 0;
}

.goods-main {
  flex: 1;
  min-width: 0;
}

.goods-title {
  font-size: 28rpx;
  line-height: 1.5;
  color: #2c3e50;
  margin-bottom: 14rpx;
}

.goods-price {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

.goods-meta {
  font-size: 22rpx;
  color: #6c757d;
  line-height: 1.7;
}

.action-btn {
  flex: 1;
}
</style>
