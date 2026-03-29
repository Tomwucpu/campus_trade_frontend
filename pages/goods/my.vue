<template>
  <view class="market-page my-goods-page" :class="themeClass">
    <view class="safe-top header-zone">
      <view class="market-shell header-shell">
        <view class="topbar-row">
          <view class="nav-back" @click="goBack">
            <text class="bi bi-arrow-left icon-font"></text>
          </view>
          <text class="page-title">我的发布</text>
          <button class="publish-btn" @click="goPublish">+ 发布</button>
        </view>
      </view>

      <scroll-view scroll-x class="tabs-scroll" show-scrollbar="false">
        <view class="tabs-row">
          <view
            v-for="item in tabs"
            :key="item.value"
            class="tab-item"
            :class="{ active: activeTab === item.value }"
            @click="setActiveTab(item.value)"
          >
            <text class="tab-label">{{ item.label }}</text>
            <view class="tab-indicator"></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="market-shell page-body">
      <view v-if="isFetching && !displayList.length" class="loading-wrap">
        <view class="loading-dot delay-0"></view>
        <view class="loading-dot delay-1"></view>
        <view class="loading-dot delay-2"></view>
      </view>

      <EmptyState
        v-else-if="!displayList.length"
        variant="list"
        icon="bi bi-box-seam"
        title="当前状态下还没有商品"
        description="你可以继续发布新的闲置，也可以切换到其他状态查看。"
        button-text="去发布"
        @action="goPublish"
      />

      <view v-else class="goods-list">
        <view
          v-for="(item, index) in displayList"
          :key="`${item.id}-${listVersion}`"
          class="goods-card"
          :style="{ animationDelay: `${index * 70}ms` }"
          @click="openDetail(item.id)"
        >
          <view class="goods-main-row" :class="{ 'without-image': !item.imageUrl }">
            <image v-if="item.imageUrl" class="goods-image" :src="item.imageUrl" mode="aspectFill"></image>
            <view v-else class="goods-image placeholder-image">
              <text class="bi bi-image icon-font"></text>
            </view>

            <view class="goods-content">
              <view class="goods-title">{{ item.title }}</view>
              <view class="price-status-row">
                <text class="goods-price">¥{{ item.priceText }}</text>
                <text class="status-pill" :class="statusBadgeClass(item.status)">{{ statusText(item.status) }}</text>
              </view>
              <view class="goods-meta-row">
                <view class="meta-item">
                  <text class="bi bi-eye icon-font meta-icon"></text>
                  <text class="meta-value">{{ item.viewCount }}</text>
                </view>
                <view class="meta-item">
                  <text class="bi bi-heart icon-font meta-icon"></text>
                  <text class="meta-value">{{ item.favoriteCount }}</text>
                </view>
                <text class="meta-date">{{ formatShortDate(item.createdAtValue, item.createdAtText) }}</text>
              </view>
            </view>
          </view>

          <view class="goods-actions" @click.stop>
            <button v-if="showEditAction(item)" class="action-pill" @click.stop="editGoods(item)">
              <text class="bi bi-pencil-square icon-font action-icon"></text>
              编辑
            </button>

            <button v-if="item.status === 'ON_SALE'" class="action-pill" @click.stop="changeStatus(item, 'OFFLINE')">
              <text class="bi bi-arrow-down-circle icon-font action-icon"></text>
              下架
            </button>
            <button v-else-if="item.status === 'OFFLINE'" class="action-pill" @click.stop="changeStatus(item, 'ON_SALE')">
              <text class="bi bi-arrow-up-circle icon-font action-icon"></text>
              上架
            </button>

            <button
              v-if="!showEditAction(item) && !showDeleteAction(item)"
              class="action-pill"
              @click.stop="openDetail(item.id)"
            >
              <text class="bi bi-box-arrow-up-right icon-font action-icon"></text>
              查看详情
            </button>

            <button v-if="showDeleteAction(item)" class="action-pill danger" @click.stop="confirmDelete(item)">
              <text class="bi bi-trash3 icon-font action-icon"></text>
              删除
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { deleteGoods, getMyGoodsList, offSaleGoods, onSaleGoods } from '../../api/goods'
import EmptyState from '../../components/EmptyState.vue'
import { useAuthStore } from '../../store/auth'
import { normalizeGoodsItem } from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      activeTab: 'ON_SALE',
      list: [],
      isFetching: false,
      listVersion: 0,
      tabs: [
        { value: 'PENDING', label: '待审核' },
        { value: 'ON_SALE', label: '在售' },
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
      this.isFetching = true
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
        .finally(() => {
          this.listVersion += 1
          this.isFetching = false
        })
    },
    showEditAction(item) {
      return item.status !== 'SOLD'
    },
    showDeleteAction(item) {
      return ['ON_SALE', 'OFFLINE', 'SOLD'].includes(item.status)
    },
    statusText(status) {
      if (status === 'ON_SALE') {
        return '在售'
      }
      if (status === 'OFFLINE') {
        return '已下架'
      }
      if (status === 'SOLD') {
        return '已售出'
      }
      return '待审核'
    },
    statusBadgeClass(status) {
      if (status === 'ON_SALE') {
        return 'sale'
      }
      if (status === 'OFFLINE') {
        return 'offline'
      }
      if (status === 'SOLD') {
        return 'sold'
      }
      return 'pending'
    },
    formatShortDate(timestamp, fallback = '') {
      const numeric = Number(timestamp || 0)
      const validTimestamp = Number.isFinite(numeric) && numeric > 0 ? numeric : new Date(fallback).getTime()
      if (!validTimestamp || Number.isNaN(validTimestamp)) {
        return '--'
      }
      const date = new Date(validTimestamp)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },
    openDetail(id) {
      uni.navigateTo({ url: `/pages/goods/detail?id=${id}` })
    },
    editGoods(item) {
      if (!item.canEdit) {
        this.showBlockedReason(item.editBlockedReason)
        return
      }
      uni.navigateTo({ url: `/pages/goods/publish?id=${item.id}` })
    },
    showBlockedReason(reason) {
      uni.showModal({
        title: '暂不可操作',
        content: reason || '当前状态暂不支持该操作',
        showCancel: false
      })
    },
    showActionConfirm(title, content) {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          success: ({ confirm }) => resolve(Boolean(confirm)),
          fail: () => resolve(false)
        })
      })
    },
    async changeStatus(item, nextStatus) {
      if (nextStatus === 'ON_SALE' && !item.canOnSale) {
        this.showBlockedReason(item.onSaleBlockedReason)
        return
      }

      if (nextStatus === 'ON_SALE' && item.hasPendingPaymentOrder) {
        const confirmed = await this.showActionConfirm(
          '重新上架',
          '重新上架后会自动取消当前商品的待付款订单，并恢复对外出售，确认继续吗？'
        )
        if (!confirmed) {
          return
        }
      }

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
    async confirmDelete(item) {
      if (!item.canDelete) {
        this.showBlockedReason(item.deleteBlockedReason)
        return
      }

      const confirmed = await this.showActionConfirm(
        '删除商品',
        item.hasPendingPaymentOrder
          ? '删除后商品会从商品列表和我的发布中移除，并自动取消当前商品的待付款订单，确认继续吗？'
          : '删除后商品会从商品列表和我的发布中移除，确认继续吗？'
      )
      if (!confirmed) {
        return
      }

      deleteGoods(item.id)
        .then((res) => {
          if (res && res.code === 0) {
            uni.showToast({ title: res.message || '商品已删除', icon: 'success' })
            this.fetchList()
            return
          }
          uni.showToast({ title: (res && res.message) || '删除失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '删除失败', icon: 'none' })
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
  --page-bg: #f3f0ea;
  --line-color: #ded7ca;
  --card-bg: rgba(248, 245, 239, 0.96);
  --card-border: rgba(216, 209, 196, 0.92);
  --title-color: #1f2e3d;
  --muted-color: #99958e;
  --price-color: #b23a2b;
  --pill-bg: #4b7759;
  --pill-text: #f5fff7;
  --btn-bg: #f4f1ea;
  --btn-text: #686055;
  background: var(--page-bg);
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.header-zone {
  position: sticky;
  top: 0;
  z-index: 22;
  background: rgba(243, 240, 234, 0.96);
  backdrop-filter: blur(10rpx);
}

.header-shell {
  padding-bottom: 18rpx;
  animation: headerFadeIn 360ms ease-out both;
}

.topbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.nav-back {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--title-color);
  font-size: 34rpx;
  transition: transform 200ms ease, background-color 200ms ease;
}

.nav-back:active {
  transform: scale(0.92);
  background: rgba(224, 216, 202, 0.36);
}

.page-title {
  flex: 1;
  text-align: left;
  color: var(--title-color);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.publish-btn {
  margin: 0;
  height: 74rpx;
  line-height: 74rpx;
  border-radius: 999rpx;
  border: none;
  padding: 0 30rpx;
  color: #ffffff;
  background: #2f2b27;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8rpx 20rpx rgba(20, 19, 17, 0.22);
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.publish-btn::after {
  border: none;
}

.publish-btn:active {
  transform: translateY(2rpx) scale(0.96);
  box-shadow: 0 4rpx 12rpx rgba(20, 19, 17, 0.24);
  opacity: 0.92;
}

.tabs-scroll {
  width: 100%;
  border-top: 1rpx solid var(--line-color);
  border-bottom: 1rpx solid var(--line-color);
}

.tabs-row {
  min-width: 100%;
  display: inline-flex;
  align-items: stretch;
}

.tab-item {
  flex: 1;
  min-width: 176rpx;
  height: 88rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 200ms ease;
}

.tab-label {
  color: var(--muted-color);
  font-size: 13px;
  font-weight: 500;
  transition: color 220ms ease, transform 220ms ease;
}

.tab-indicator {
  position: absolute;
  left: 18%;
  bottom: 0;
  width: 64%;
  height: 6rpx;
  border-radius: 999rpx;
  background: #302d29;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 260ms cubic-bezier(0.34, 1.2, 0.64, 1);
}

.tab-item.active .tab-label {
  color: var(--title-color);
  font-weight: 600;
  transform: translateY(-1rpx);
}

.tab-item.active .tab-indicator {
  transform: scaleX(1);
}

.tab-item:active {
  background: rgba(224, 216, 202, 0.3);
}

.page-body {
  padding-top: 28rpx;
}

.loading-wrap {
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.loading-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #9f998f;
  animation: loadingBounce 900ms ease-in-out infinite;
}

.loading-dot.delay-1 {
  animation-delay: 120ms;
}

.loading-dot.delay-2 {
  animation-delay: 240ms;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.goods-card {
  background: var(--card-bg);
  border: 1rpx solid var(--card-border);
  border-radius: 30rpx;
  padding: 24rpx;
  box-shadow: 0 10rpx 26rpx rgba(129, 117, 101, 0.1);
  animation: cardRiseIn 420ms cubic-bezier(0.2, 0.78, 0.22, 1) both;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.goods-card:active {
  transform: translateY(2rpx) scale(0.992);
  box-shadow: 0 6rpx 14rpx rgba(129, 117, 101, 0.16);
}

.goods-main-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.goods-main-row.without-image {
  gap: 0;
}

.goods-image {
  width: 146rpx;
  height: 146rpx;
  border-radius: 24rpx;
  background: #e9e2d7;
  flex-shrink: 0;
}

.placeholder-image {
  color: #a59f94;
  font-size: 38rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goods-content {
  min-width: 0;
  flex: 1;
}

.goods-title {
  color: var(--title-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.34;
  margin-bottom: 10rpx;
  word-break: break-all;
}

.price-status-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.goods-price {
  color: var(--price-color);
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.status-pill {
  height: 48rpx;
  border-radius: 999rpx;
  padding: 0 20rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 400;
  line-height: 1;
  color: var(--pill-text);
  background: var(--pill-bg);
}

.status-pill.offline {
  background: #8b8a84;
}

.status-pill.sold {
  background: #73767c;
}

.status-pill.pending {
  background: #b58538;
}

.goods-meta-row {
  display: flex;
  align-items: center;
  gap: 22rpx;
  color: var(--muted-color);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
}

.meta-icon {
  font-size: 24rpx;
}

.meta-value,
.meta-date {
  font-size: 11px;
  color: var(--muted-color);
}

.meta-date {
  margin-left: auto;
}

.goods-actions {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.action-pill {
  margin: 0;
  min-width: 160rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 999rpx;
  border: 1rpx solid #d8d0c2;
  background: var(--btn-bg);
  color: var(--btn-text);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 24rpx;
  transition: transform 170ms ease, background-color 170ms ease, border-color 170ms ease;
}

.action-pill::after {
  border: none;
}

.action-pill:active {
  transform: scale(0.96);
  background: #ece6dc;
}

.action-icon {
  font-size: 24rpx;
}

.action-pill.danger {
  color: #aa4b3f;
  border-color: rgba(171, 84, 71, 0.24);
  background: #fdf3f1;
}

.action-pill.danger:active {
  background: #f8e5e1;
}

@keyframes cardRiseIn {
  from {
    opacity: 0;
    transform: translateY(26rpx) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes headerFadeIn {
  from {
    opacity: 0;
    transform: translateY(-12rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingBounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.56;
  }
  50% {
    transform: translateY(-10rpx);
    opacity: 1;
  }
}
</style>
