<template>
  <view class="market-page publish-page" :class="themeClass">
    <view class="market-shell safe-top">
      <view class="market-topbar publish-topbar">
        <view class="market-back-btn" @tap="goBack">
          <text class="market-back-symbol">‹</text>
        </view>
        <view class="market-page-title">{{ pageTitle }}</view>
        <view class="market-icon-btn placeholder-btn"></view>
      </view>

      <view class="market-card publish-card">
        <view class="market-row-head">
          <view>
            <view class="market-section-title">商品图片</view>
            <view class="market-section-subtitle">最多上传 9 张，当前图片仅用于本地预览展示。</view>
          </view>
          <view class="image-count">{{ imageList.length }}/9</view>
        </view>

        <view class="image-grid">
          <view v-for="(item, index) in imageList" :key="`${item}-${index}`" class="image-item">
            <image class="image-preview" :src="item" mode="aspectFill"></image>
            <view class="image-remove" @click="removeImage(index)">×</view>
          </view>
          <view v-if="imageList.length < 9" class="image-uploader" @click="chooseImages">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片</text>
          </view>
        </view>
      </view>

      <view class="market-card publish-card">
        <view class="field-group">
          <view class="field-label">商品标题</view>
          <input
            v-model="form.title"
            class="market-input"
            maxlength="50"
            placeholder="简洁描述你的商品"
            @input="saveDraft"
          />
          <view class="field-count">{{ form.title.length }}/50</view>
        </view>

        <view class="field-group">
          <view class="field-label">商品类目</view>
          <view class="select-field" @click="showCategoryPicker = true">
            <text :class="{ placeholder: !selectedCategoryName }">{{ selectedCategoryName || '请选择类目' }}</text>
            <text class="select-arrow">›</text>
          </view>
        </view>

        <view class="field-inline">
          <view class="field-group half">
            <view class="field-label">出售价格</view>
            <view class="price-shell">
              <text class="price-symbol">¥</text>
              <input
                v-model="form.price"
                class="price-value"
                type="digit"
                placeholder="0.00"
                @input="saveDraft"
              />
            </view>
          </view>

          <view class="field-group half">
            <view class="field-label">原价</view>
            <view class="price-shell">
              <text class="price-symbol">¥</text>
              <input
                v-model="form.originalPrice"
                class="price-value"
                type="digit"
                placeholder="选填"
                @input="saveDraft"
              />
            </view>
          </view>
        </view>

        <view class="field-group">
          <view class="field-label">商品成色</view>
          <view class="select-field" @click="showConditionPicker = true">
            <text :class="{ placeholder: !selectedConditionLabel }">{{ selectedConditionLabel || '请选择成色' }}</text>
            <text class="select-arrow">›</text>
          </view>
        </view>

        <view class="field-group">
          <view class="field-label">商品描述</view>
          <textarea
            v-model="form.description"
            class="market-textarea"
            maxlength="500"
            placeholder="详细描述商品的使用情况、配件和交易方式"
            @input="saveDraft"
          />
          <view class="field-count">{{ form.description.length }}/500</view>
        </view>
      </view>

      <button class="market-primary-btn submit-btn" @click="submit">{{ submitButtonText }}</button>
      <view class="submit-tip">{{ submitTip }}</view>
    </view>

    <view v-if="showCategoryPicker" class="picker-mask" @click="showCategoryPicker = false">
      <view class="picker-sheet" @click.stop>
        <view class="picker-title">选择类目</view>
        <view
          v-for="item in categories"
          :key="item.id"
          class="picker-item"
          :class="{ active: Number(form.categoryId) === Number(item.id) }"
          @click="selectCategory(item)"
        >
          {{ item.name }}
        </view>
      </view>
    </view>

    <view v-if="showConditionPicker" class="picker-mask" @click="showConditionPicker = false">
      <view class="picker-sheet" @click.stop>
        <view class="picker-title">选择成色</view>
        <view
          v-for="item in conditionOptions"
          :key="item.value"
          class="picker-item"
          :class="{ active: Number(form.conditionLevel) === Number(item.value) }"
          @click="selectCondition(item)"
        >
          {{ item.label }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { createGoods, getGoodsCategories, getGoodsDetail, updateGoods } from '../../api/goods'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import {
  getConditionOptions,
  getDefaultCategoryList,
  normalizeGoodsItem,
  pushLocalMessage
} from '../../utils/market'
import { syncThemePage } from '../../utils/theme'

const DRAFT_KEY = 'goods_publish_draft'

function createDefaultForm() {
  return {
    title: '',
    categoryId: 1,
    conditionLevel: 9,
    price: '',
    originalPrice: '',
    description: '',
    images: []
  }
}

export default {
  data() {
    return {
      id: '',
      isEdit: false,
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      goodsStore: useGoodsStore(),
      form: createDefaultForm(),
      categories: getDefaultCategoryList(),
      conditionOptions: getConditionOptions(),
      showCategoryPicker: false,
      showConditionPicker: false
    }
  },
  computed: {
    draftKey() {
      return this.isEdit && this.id ? `${DRAFT_KEY}_${this.id}` : DRAFT_KEY
    },
    imageList() {
      return Array.isArray(this.form.images) ? this.form.images : []
    },
    selectedCategoryName() {
      const current = this.categories.find((item) => String(item.id) === String(this.form.categoryId))
      return current ? current.name : ''
    },
    selectedConditionLabel() {
      const current = this.conditionOptions.find((item) => Number(item.value) === Number(this.form.conditionLevel))
      return current ? current.label : ''
    },
    pageTitle() {
      return this.isEdit ? '编辑商品' : '发布商品'
    },
    submitButtonText() {
      return this.isEdit ? '保存修改' : '提交审核'
    },
    submitTip() {
      return this.isEdit
        ? '修改会立即同步到商品详情页，方便你继续调整描述和价格。'
        : '提交后商品会立即进入列表展示，后续可继续补充图片与说明。'
    }
  },
  onLoad(options) {
    syncThemePage(this)
    this.id = (options && options.id) || ''
    this.isEdit = Boolean(this.id)
    if (this.isEdit && !this.authStore.sync().isLoggedIn()) {
      uni.showToast({ title: '请先登录后再编辑商品', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return
    }
    this.restoreDraft()
    this.fetchCategories()
    if (this.isEdit && !this.form.title) {
      this.fetchDetail()
    }
  },
  onShow() {
    syncThemePage(this)
  },
  methods: {
    saveDraft() {
      uni.setStorageSync(this.draftKey, this.form)
    },
    restoreDraft() {
      const draft = uni.getStorageSync(this.draftKey)
      this.form = draft && typeof draft === 'object' ? { ...createDefaultForm(), ...draft } : createDefaultForm()
    },
    fetchCategories() {
      getGoodsCategories()
        .then((res) => {
          if (res && res.code === 0 && Array.isArray(res.data) && res.data.length) {
            this.categories = res.data
            if (!this.form.categoryId) {
              this.form.categoryId = res.data[0].id
            }
          }
        })
        .catch(() => {})
    },
    fetchDetail() {
      getGoodsDetail(this.id)
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            const detail = normalizeGoodsItem(res.data, 0)
            this.form = {
              ...createDefaultForm(),
              title: detail.title || '',
              categoryId: detail.categoryId || 1,
              conditionLevel: Number(detail.conditionLevel) || 9,
              price: detail.priceValue ? String(detail.priceValue) : '',
              originalPrice: detail.originalPriceValue ? String(detail.originalPriceValue) : '',
              description: detail.description || '',
              images: Array.isArray(detail.gallery) && detail.gallery.length ? detail.gallery.slice(0, 9) : []
            }
            this.saveDraft()
            return
          }
          uni.showToast({ title: (res && res.message) || '商品加载失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '商品加载失败', icon: 'none' })
        })
    },
    chooseImages() {
      uni.chooseImage({
        count: 9 - this.imageList.length,
        success: (res) => {
          this.form.images = [...this.imageList, ...(res.tempFilePaths || [])].slice(0, 9)
          this.saveDraft()
        }
      })
    },
    removeImage(index) {
      this.form.images = this.imageList.filter((item, currentIndex) => currentIndex !== index)
      this.saveDraft()
    },
    selectCategory(item) {
      this.form.categoryId = item.id
      this.showCategoryPicker = false
      this.saveDraft()
    },
    selectCondition(item) {
      this.form.conditionLevel = item.value
      this.showConditionPicker = false
      this.saveDraft()
    },
    submit() {
      if (!this.authStore.sync().isLoggedIn()) {
        uni.showToast({ title: '请先登录后再操作', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user/login' })
        }, 260)
        return
      }

      if (!this.form.title || !this.form.price || !this.form.description) {
        uni.showToast({ title: '请补全标题、价格和描述', icon: 'none' })
        return
      }

      const price = Number(this.form.price)
      const originalPrice = this.form.originalPrice ? Number(this.form.originalPrice) : null
      if (!price || Number.isNaN(price) || price <= 0) {
        uni.showToast({ title: '请输入正确的出售价格', icon: 'none' })
        return
      }
      if (originalPrice !== null && (Number.isNaN(originalPrice) || originalPrice < 0)) {
        uni.showToast({ title: '请输入正确的原价', icon: 'none' })
        return
      }

      const payload = {
        title: this.form.title.trim(),
        categoryId: Number(this.form.categoryId),
        conditionLevel: Number(this.form.conditionLevel),
        price,
        originalPrice,
        description: this.form.description.trim()
      }
      const action = this.isEdit ? () => updateGoods(this.id, payload) : () => createGoods(payload)

      action()
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            const targetId = res.data.id || this.id
            uni.removeStorageSync(this.draftKey)
            pushLocalMessage({
              type: 'audit',
              title: this.isEdit ? '商品修改成功' : '商品发布成功',
              content: this.isEdit
                ? `你发布的“${payload.title}”已完成修改。`
                : `你发布的“${payload.title}”已成功进入市集列表。`
            })
            this.goodsStore.setLastViewedId(targetId)
            this.form = createDefaultForm()
            uni.showToast({ title: res.message || (this.isEdit ? '修改成功' : '发布成功'), icon: 'success' })
            setTimeout(() => {
              uni.redirectTo({ url: `/pages/goods/detail?id=${targetId}` })
            }, 260)
            return
          }
          uni.showToast({ title: (res && res.message) || '提交失败', icon: 'none' })
        })
        .catch(() => {
          uni.showToast({ title: '提交失败', icon: 'none' })
        })
    },
    goBack() {
      if (this.showCategoryPicker) {
        this.showCategoryPicker = false
        return
      }

      if (this.showConditionPicker) {
        this.showConditionPicker = false
        return
      }

      const pages = getCurrentPages()
      if (Array.isArray(pages) && pages.length > 1) {
        uni.navigateBack({
          delta: 1
        })
        return
      }

      uni.reLaunch({ url: '/pages/index/index' })
    }
  }
}
</script>

<style scoped>
.publish-page {
  padding-bottom: 60rpx;
}

.publish-topbar {
  margin-bottom: 24rpx;
}

.placeholder-btn {
  opacity: 0;
}

.publish-card {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.image-count {
  font-size: 22rpx;
  color: #6c757d;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.image-item,
.image-uploader {
  position: relative;
  height: 200rpx;
  border-radius: 22rpx;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-remove {
  position: absolute;
  right: 12rpx;
  top: 12rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.image-uploader {
  border: 2rpx dashed #d7dee5;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.upload-icon {
  font-size: 44rpx;
  color: #2d6a4f;
}

.upload-text {
  font-size: 22rpx;
  color: #6c757d;
}

.field-group + .field-group {
  margin-top: 24rpx;
}

.field-inline {
  display: flex;
  gap: 16rpx;
}

.field-group.half {
  flex: 1;
  min-width: 0;
}

.field-label {
  font-size: 24rpx;
  color: #2c3e50;
  margin-bottom: 14rpx;
  font-weight: 700;
}

.field-count {
  margin-top: 10rpx;
  text-align: right;
  font-size: 21rpx;
  color: #adb5bd;
}

.select-field {
  min-height: 90rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #2c3e50;
}

.select-field .placeholder {
  color: #adb5bd;
}

.select-arrow {
  font-size: 30rpx;
  color: #adb5bd;
}

.price-shell {
  min-height: 90rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
}

.price-symbol {
  font-size: 28rpx;
  color: #2c3e50;
  margin-right: 10rpx;
}

.price-value {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #2c3e50;
}

.submit-btn {
  width: 100%;
}

.submit-tip {
  margin-top: 18rpx;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.7;
  color: #6c757d;
}

.picker-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  display: flex;
  align-items: flex-end;
  z-index: 40;
}

.picker-sheet {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 28rpx 24rpx calc(40rpx + env(safe-area-inset-bottom));
}

.picker-title {
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 22rpx;
}

.picker-item {
  min-height: 82rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  color: #2c3e50;
  font-size: 25rpx;
}

.picker-item + .picker-item {
  margin-top: 12rpx;
}

.picker-item.active {
  background: #e8f5e9;
  color: #2d6a4f;
}
</style>
