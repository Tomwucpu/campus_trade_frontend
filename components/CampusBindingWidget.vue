<template>
  <view
    v-if="variant === 'entry'"
    class="campus-binding campus-binding--entry"
    :class="toneClass"
    @click="handleEntryClick"
  >
    <view class="campus-binding__copy">
      <view class="campus-binding__name">{{ displayName }}</view>
      <view v-if="description" class="campus-binding__description">{{ description }}</view>
    </view>
    <uni-icons class="campus-binding__arrow" type="right" :size="14" :color="arrowColor"></uni-icons>
  </view>

  <view v-else class="campus-binding" :class="[variantClass, toneClass]">
    <template v-if="variant === 'card'">
      <view class="campus-binding__head">
        <view class="campus-binding__head-copy">
          <view class="campus-binding__title">{{ title }}</view>
          <view class="campus-binding__name campus-binding__name--card">{{ displayName }}</view>
        </view>
        <view v-if="badgeText" class="campus-binding__badge">{{ badgeText }}</view>
      </view>
      <view v-if="description" class="campus-binding__description campus-binding__description--card">{{ description }}</view>
    </template>

    <template v-else>
      <view class="campus-binding__readonly" :class="{ 'campus-binding__readonly--empty': empty }">
        <view class="campus-binding__name campus-binding__name--readonly">{{ displayName }}</view>
        <view v-if="description" class="campus-binding__description campus-binding__description--readonly">{{ description }}</view>
      </view>
    </template>

    <view v-if="canShowActions" class="campus-binding__actions">
      <button class="campus-binding__action campus-binding__action--secondary" @click="handleSecondaryAction">
        {{ secondaryActionText }}
      </button>
      <button class="campus-binding__action campus-binding__action--primary" @click="handlePrimaryAction">
        {{ primaryActionText }}
      </button>
    </view>
  </view>
</template>

<script>
import { bindCampusByLocation, bindCampusManual, resolveCampusByLocation } from '../api/auth'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { useAuthStore } from '../store/auth'
import { useGoodsStore } from '../store/goods'
import {
  chooseCampusOption,
  requestCampusLocation,
  syncCampusProfile
} from '../utils/campus'

const LOGIN_PAGE_URL = '/pages/user/login'
const PREFERENCE_ACTION_ITEMS = Object.freeze([
  '定位识别校区',
  '手动选择校区'
])
const BINDING_ACTION_ITEMS = Object.freeze([
  '定位绑定校区',
  '手动绑定校区'
])
const ARROW_COLOR_MAP = Object.freeze({
  home: '#8a8f98',
  list: '#a9a194',
  publish: '#8a8f98',
  profile: '#7d7164'
})

export default {
  name: 'CampusBindingWidget',
  components: {
    UniIcons
  },
  props: {
    variant: {
      type: String,
      default: 'entry'
    },
    mode: {
      type: String,
      default: 'binding'
    },
    tone: {
      type: String,
      default: 'home'
    },
    title: {
      type: String,
      default: ''
    },
    displayName: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    badgeText: {
      type: String,
      default: ''
    },
    secondaryActionText: {
      type: String,
      default: '手动选择'
    },
    primaryActionText: {
      type: String,
      default: '定位绑定'
    },
    showActions: {
      type: Boolean,
      default: false
    },
    empty: {
      type: Boolean,
      default: false
    },
    loginUrl: {
      type: String,
      default: LOGIN_PAGE_URL
    }
  },
  emits: ['updated'],
  data() {
    return {
      authStore: useAuthStore(),
      goodsStore: useGoodsStore()
    }
  },
  computed: {
    toneClass() {
      return `campus-binding--${this.tone}`
    },
    variantClass() {
      return `campus-binding--${this.variant}`
    },
    isPreferenceMode() {
      return this.mode === 'preference'
    },
    isReadonlyMode() {
      return this.mode === 'readonly'
    },
    canShowActions() {
      return this.showActions && !this.isReadonlyMode
    },
    arrowColor() {
      return ARROW_COLOR_MAP[this.tone] || ARROW_COLOR_MAP.home
    }
  },
  methods: {
    isLoggedIn() {
      return this.authStore.sync().isLoggedIn()
    },
    emitUpdated(type, payload = {}) {
      this.$emit('updated', {
        type,
        mode: this.mode,
        ...payload
      })
    },
    navigateToLogin() {
      uni.navigateTo({ url: this.loginUrl || LOGIN_PAGE_URL })
    },
    openEntryActions() {
      return this.handleEntryClick()
    },
    triggerManualAction() {
      if (this.isReadonlyMode) {
        return
      }
      if (this.isPreferenceMode) {
        return this.handlePreferenceManualAction()
      }
      return this.handleBindingManualAction()
    },
    triggerLocationAction() {
      if (this.isReadonlyMode) {
        return
      }
      if (this.isPreferenceMode) {
        return this.handlePreferenceLocationAction()
      }
      return this.handleBindingLocationAction()
    },
    handleEntryClick() {
      if (this.isReadonlyMode) {
        return
      }
      if (this.isPreferenceMode) {
        this.openPreferenceActionSheet()
        return
      }
      this.openBindingActionSheet()
    },
    handleSecondaryAction() {
      this.triggerManualAction()
    },
    handlePrimaryAction() {
      this.triggerLocationAction()
    },
    openPreferenceActionSheet() {
      uni.showActionSheet({
        itemList: PREFERENCE_ACTION_ITEMS.slice(),
        success: async ({ tapIndex }) => {
          if (tapIndex === 0) {
            await this.handlePreferenceLocationAction()
            return
          }
          await this.handlePreferenceManualAction()
        }
      })
    },
    openBindingActionSheet() {
      if (!this.isLoggedIn()) {
        this.navigateToLogin()
        return
      }
      uni.showActionSheet({
        itemList: BINDING_ACTION_ITEMS.slice(),
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            this.handleBindingLocationAction()
            return
          }
          this.handleBindingManualAction()
        }
      })
    },
    async handlePreferenceManualAction() {
      const selectedCampus = await chooseCampusOption()
      if (!selectedCampus) {
        return
      }

      this.goodsStore.setPreferredCampusCode(selectedCampus.code)
      this.emitUpdated('preference-manual', {
        campusCode: selectedCampus.code,
        campusName: selectedCampus.name || ''
      })
      uni.showToast({ title: '校区已更新', icon: 'success' })
    },
    async handleBindingManualAction() {
      if (!this.isLoggedIn()) {
        this.navigateToLogin()
        return
      }

      const selectedCampus = await chooseCampusOption()
      if (!selectedCampus) {
        return
      }

      uni.showLoading({ title: '校区绑定中', mask: true })
      try {
        const res = await bindCampusManual({ campusCode: selectedCampus.code })
        if (!res || res.code !== 0 || !res.data) {
          throw new Error((res && res.message) || '校区绑定失败')
        }
        const profile = syncCampusProfile(res.data)
        const campusCode = profile.campusCode || selectedCampus.code || ''
        this.goodsStore.setPreferredCampusCode(campusCode)
        this.emitUpdated('binding-manual', {
          campusCode,
          campusName: profile.campusName || selectedCampus.name || '',
          profile
        })
        uni.showToast({ title: '账号校区已更新', icon: 'success' })
      } catch (error) {
        uni.showToast({
          title: error && error.message ? error.message : '校区绑定失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    async handleBindingLocationAction() {
      if (!this.isLoggedIn()) {
        this.navigateToLogin()
        return
      }

      let loadingShown = false
      try {
        const location = await requestCampusLocation()
        uni.showLoading({ title: '定位绑定中', mask: true })
        loadingShown = true
        const res = await bindCampusByLocation(location)
        if (!res || res.code !== 0 || !res.data) {
          throw new Error((res && res.message) || '定位绑定失败')
        }
        const profile = syncCampusProfile(res.data)
        const campusCode = profile.campusCode || ''
        this.goodsStore.setPreferredCampusCode(campusCode)
        this.emitUpdated('binding-location', {
          campusCode,
          campusName: profile.campusName || '',
          profile
        })
        uni.showToast({ title: '账号校区已更新', icon: 'success' })
      } catch (error) {
        if (loadingShown) {
          uni.hideLoading()
        }
        this.showLocationFallback(error, () => {
          this.handleBindingManualAction()
        })
        return
      }

      if (loadingShown) {
        uni.hideLoading()
      }
    },
    async handlePreferenceLocationAction() {
      let loadingShown = false
      try {
        const location = await requestCampusLocation()
        uni.showLoading({ title: '定位识别中', mask: true })
        loadingShown = true
        const res = await resolveCampusByLocation(location)
        if (!res || res.code !== 0 || !res.data || !res.data.campusCode) {
          throw new Error((res && res.message) || '定位识别失败')
        }
        this.goodsStore.setPreferredCampusCode(res.data.campusCode)
        this.emitUpdated('preference-location', {
          campusCode: res.data.campusCode,
          campusName: res.data.campusName || ''
        })
        uni.showToast({ title: '校区已更新', icon: 'success' })
      } catch (error) {
        if (loadingShown) {
          uni.hideLoading()
        }
        this.showLocationFallback(error, () => {
          this.handlePreferenceManualAction()
        })
        return
      }

      if (loadingShown) {
        uni.hideLoading()
      }
    },
    showLocationFallback(error, retryHandler) {
      uni.showModal({
        title: '定位失败',
        content: (error && error.message) || '无法识别当前位置，请手动选择校区',
        confirmText: '手动选择',
        cancelText: '稍后再说',
        success: ({ confirm }) => {
          if (confirm && typeof retryHandler === 'function') {
            retryHandler()
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.campus-binding {
  --cb-panel-bg: #ffffff;
  --cb-panel-border: rgba(216, 209, 196, 0.9);
  --cb-panel-shadow: none;
  --cb-title-color: #7d7164;
  --cb-name-color: #2f3339;
  --cb-desc-color: #8a8f98;
  --cb-badge-bg: rgba(236, 229, 219, 0.96);
  --cb-badge-color: #7d7164;
  --cb-secondary-bg: #ffffff;
  --cb-secondary-border: transparent;
  --cb-secondary-color: #7d7164;
  --cb-primary-bg: #2e2923;
  --cb-primary-color: #ffffff;
  --cb-readonly-bg: rgba(255, 255, 255, 0.9);
  --cb-readonly-border: rgba(216, 209, 196, 0.9);
}

.campus-binding--entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin: var(--cb-entry-margin, 0);
  padding: var(--cb-entry-padding, 20rpx 22rpx);
  border-radius: var(--cb-entry-radius, 24rpx);
  border: 1rpx solid var(--cb-panel-border);
  background: var(--cb-panel-bg);
  box-shadow: var(--cb-panel-shadow);
}

.campus-binding--card {
  margin-bottom: var(--cb-card-margin-bottom, 0);
  padding: var(--cb-card-padding, 24rpx);
  border-radius: var(--cb-card-radius, 26rpx);
  border: 1rpx solid var(--cb-panel-border);
  background: var(--cb-panel-bg);
  box-shadow: var(--cb-panel-shadow);
}

.campus-binding__copy,
.campus-binding__head-copy {
  min-width: 0;
  flex: 1;
}

.campus-binding__arrow {
  flex-shrink: 0;
}

.campus-binding__name {
  font-size: 27rpx;
  font-weight: 600;
  line-height: 1.45;
  color: var(--cb-name-color);
  word-break: break-all;
}

.campus-binding__name--card {
  margin-top: 10rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.campus-binding__description {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--cb-desc-color);
  word-break: break-all;
}

.campus-binding__description--card {
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
}

.campus-binding__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.campus-binding__title {
  font-size: 24rpx;
  color: var(--cb-title-color);
}

.campus-binding__badge {
  min-width: 110rpx;
  min-height: 44rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: var(--cb-badge-bg);
  color: var(--cb-badge-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 600;
}

.campus-binding__readonly {
  padding: var(--cb-readonly-padding, 20rpx 22rpx);
  border-radius: var(--cb-readonly-radius, 20rpx);
  border: 1rpx solid var(--cb-readonly-border);
  background: var(--cb-readonly-bg);
}

.campus-binding__readonly--empty {
  border-style: dashed;
}

.campus-binding__name--readonly {
  line-height: 1.5;
}

.campus-binding__description--readonly {
  line-height: 1.7;
}

.campus-binding__actions {
  display: flex;
  gap: 16rpx;
  margin-top: var(--cb-actions-margin-top, 18rpx);
}

.campus-binding__action {
  flex: 1;
  min-width: 0;
  height: var(--cb-action-height, 74rpx);
  line-height: var(--cb-action-height, 74rpx);
  border-radius: var(--cb-action-radius, 18rpx);
  font-size: var(--cb-action-font-size, 24rpx);
  font-weight: 600;
}

.campus-binding__action::after {
  border: none;
}

.campus-binding__action--secondary {
  background: var(--cb-secondary-bg);
  color: var(--cb-secondary-color);
  border: 1rpx solid var(--cb-secondary-border);
}

.campus-binding__action--primary {
  background: var(--cb-primary-bg);
  color: var(--cb-primary-color);
}

.campus-binding--home {
  --cb-entry-margin: 20rpx 0 0;
  --cb-entry-padding: 22rpx 24rpx;
  --cb-entry-radius: 26rpx;
  --cb-panel-bg: rgba(255, 255, 255, 0.84);
  --cb-panel-border: rgba(232, 234, 237, 0.92);
  --cb-panel-shadow: 0 16rpx 30rpx rgba(31, 35, 41, 0.05);
  --cb-name-color: #2f3339;
  --cb-desc-color: #8a8f98;
}

.campus-binding--home .campus-binding__name {
  font-size: 28rpx;
}

.campus-binding--list {
  --cb-entry-margin: 0 0 18rpx;
  --cb-entry-padding: 20rpx 22rpx;
  --cb-entry-radius: 24rpx;
  --cb-panel-bg: rgba(255, 255, 255, 0.88);
  --cb-panel-border: rgba(216, 209, 196, 0.9);
  --cb-panel-shadow: 0 12rpx 24rpx rgba(39, 35, 30, 0.06);
  --cb-name-color: #2c3e50;
  --cb-desc-color: #8f8679;
}

.campus-binding--publish {
  --cb-readonly-border: var(--publish-border);
  --cb-readonly-bg: rgba(255, 255, 255, 0.9);
  --cb-name-color: var(--campus-text);
  --cb-desc-color: var(--publish-muted);
  --cb-actions-margin-top: 18rpx;
  --cb-action-height: 74rpx;
  --cb-action-font-size: 24rpx;
  --cb-secondary-bg: rgba(255, 255, 255, 0.94);
  --cb-secondary-border: var(--publish-border);
  --cb-secondary-color: var(--publish-accent-strong);
  --cb-primary-bg: var(--publish-accent-strong);
  --cb-primary-color: #ffffff;
}

.campus-binding--profile {
  --cb-card-margin-bottom: 22rpx;
  --cb-panel-bg: rgba(247, 243, 237, 0.95);
  --cb-panel-border: #d8cfc4;
  --cb-title-color: #7d7164;
  --cb-name-color: #2e2923;
  --cb-desc-color: #6f6255;
  --cb-badge-bg: #ece5db;
  --cb-badge-color: #7d7164;
  --cb-secondary-bg: #ffffff;
  --cb-secondary-color: #7d7164;
  --cb-primary-bg: #2e2923;
  --cb-primary-color: #ffffff;
  --cb-action-height: 76rpx;
  --cb-action-font-size: 25rpx;
  --cb-actions-margin-top: 22rpx;
}
</style>
