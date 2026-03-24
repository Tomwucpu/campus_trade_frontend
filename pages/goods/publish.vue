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
            <view class="market-section-subtitle">最多上传 9 张，AI 识别会优先使用前 3 张代表图。</view>
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

      <view class="market-card publish-card ai-card">
        <view class="market-row-head ai-row-head">
          <view>
            <view class="market-section-title">智能识别估价</view>
            <view class="market-section-subtitle">识别商品、成色和参考价格，结果仅供发布时参考。</view>
          </view>
          <button
            class="ai-trigger-btn"
            size="mini"
            :loading="aiLoading"
            :disabled="aiLoading || !imageList.length"
            @click="runAiValuation"
          >
            {{ aiValuation ? '重新识别' : '开始识别' }}
          </button>
        </view>

        <view class="ai-tip">
          识别失败不会影响正常发布。建议拍摄正面图、细节图和配件图，结果会更稳定。
        </view>

        <view v-if="!aiValuation" class="ai-empty">
          <view class="ai-empty-title">还没有识别结果</view>
          <view class="ai-empty-text">上传 1 到 3 张清晰商品图后，点击“开始识别”即可生成标题、成色和价格建议。</view>
        </view>

        <view v-else class="ai-result-card">
          <view class="ai-result-header">
            <view>
              <view class="ai-item-name">{{ aiValuation.itemName || '未识别出具体商品' }}</view>
              <view v-if="aiBrandModelText" class="ai-item-meta">{{ aiBrandModelText }}</view>
            </view>
            <view class="ai-confidence-chip" :class="`confidence-${aiValuation.confidenceLevel || 'medium'}`">
              {{ aiConfidenceText }}
            </view>
          </view>

          <view class="ai-metric-grid">
            <view class="ai-metric">
              <view class="ai-metric-label">建议分类</view>
              <view class="ai-metric-value">{{ aiValuation.categoryNameSuggest || '待确认' }}</view>
            </view>
            <view class="ai-metric">
              <view class="ai-metric-label">识别成色</view>
              <view class="ai-metric-value">{{ aiValuation.conditionText || '待确认' }}</view>
            </view>
            <view class="ai-metric">
              <view class="ai-metric-label">价格区间</view>
              <view class="ai-metric-value ai-price-range">{{ priceRangeText || '待确认' }}</view>
            </view>
            <view class="ai-metric">
              <view class="ai-metric-label">建议发布价</view>
              <view class="ai-metric-value ai-price-strong">
                {{ aiValuation.suggestedPrice ? `¥${formatMoney(aiValuation.suggestedPrice)}` : '待确认' }}
              </view>
            </view>
          </view>

          <view v-if="aiResultIssues.length" class="ai-block">
            <view class="ai-block-title">可见问题</view>
            <view class="ai-badge-list">
              <text v-for="(item, index) in aiResultIssues" :key="`issue-${index}`" class="ai-badge danger">
                {{ item }}
              </text>
            </view>
          </view>

          <view v-if="aiSuggestions.length" class="ai-block">
            <view class="ai-block-title">补充建议</view>
            <view class="ai-list">
              <view v-for="(item, index) in aiSuggestions" :key="`suggestion-${index}`" class="ai-list-item">
                <text class="ai-list-dot"></text>
                <text class="ai-list-text">{{ item }}</text>
              </view>
            </view>
          </view>

          <view class="ai-note">
            价格会受到学校区域、附件完整度和图片清晰度影响，请在发布前再手动确认一次。
          </view>

          <view class="ai-actions">
            <button class="ai-secondary-btn" :disabled="aiLoading" @click="runAiValuation">重新识别</button>
            <button
              class="market-primary-btn ai-primary-btn"
              :loading="applyingSuggestion"
              :disabled="applyingSuggestion"
              @click="applyAiSuggestion"
            >
              应用建议
            </button>
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
            placeholder="详细描述商品的使用情况、配件情况和交易方式"
            @input="saveDraft"
          />
          <view class="field-count">{{ form.description.length }}/500</view>
        </view>
      </view>

      <button class="market-primary-btn submit-btn" :disabled="submitting" @click="submit">{{ submitButtonText }}</button>
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
import {
  adoptAiValuation,
  createAiValuation,
  createGoods,
  getGoodsCategories,
  getGoodsDetail,
  updateGoods,
  uploadGoodsImage
} from '../../api/goods'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import {
  getConditionOptions,
  getDefaultCategoryList,
  normalizeGoodsItem
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

function createDefaultDraft() {
  return {
    form: createDefaultForm(),
    aiValuation: null,
    categoryTouched: false
  }
}

function clampConditionLevel(value) {
  const numeric = Number(value)
  if (!numeric || Number.isNaN(numeric)) {
    return 9
  }
  return Math.max(1, Math.min(10, Math.round(numeric)))
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
      aiValuation: null,
      categoryTouched: false,
      categories: getDefaultCategoryList(),
      conditionOptions: getConditionOptions(),
      showCategoryPicker: false,
      showConditionPicker: false,
      aiLoading: false,
      applyingSuggestion: false,
      submitting: false
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
      if (current) {
        return current.label
      }
      const conditionLevel = Number(this.form.conditionLevel)
      if (!conditionLevel) {
        return ''
      }
      return conditionLevel >= 10 ? '全新' : `${conditionLevel}成新`
    },
    pageTitle() {
      return this.isEdit ? '编辑商品' : '发布商品'
    },
    submitButtonText() {
      if (this.submitting) {
        return this.isEdit ? '保存中...' : '发布中...'
      }
      return this.isEdit ? '保存修改' : '立即发布'
    },
    submitTip() {
      return this.isEdit
        ? '修改会立即同步到商品详情页，方便你继续调整描述和价格。'
        : '提交后商品会立即进入列表展示，图片会一起保存到本地上传目录。'
    },
    aiBrandModelText() {
      if (!this.aiValuation) {
        return ''
      }
      return [this.aiValuation.brand, this.aiValuation.model].filter(Boolean).join(' / ')
    },
    priceRangeText() {
      if (!this.aiValuation || (!this.aiValuation.priceLow && !this.aiValuation.priceHigh)) {
        return ''
      }
      const low = this.aiValuation.priceLow ? `¥${this.formatMoney(this.aiValuation.priceLow)}` : '--'
      const high = this.aiValuation.priceHigh ? `¥${this.formatMoney(this.aiValuation.priceHigh)}` : '--'
      return `${low} - ${high}`
    },
    aiConfidenceText() {
      const level = (this.aiValuation && this.aiValuation.confidenceLevel) || 'medium'
      if (level === 'high') {
        return '高置信'
      }
      if (level === 'low') {
        return '低置信'
      }
      return '中等置信'
    },
    aiResultIssues() {
      return this.aiValuation && Array.isArray(this.aiValuation.visibleIssues)
        ? this.aiValuation.visibleIssues.filter(Boolean)
        : []
    },
    aiSuggestions() {
      return this.aiValuation && Array.isArray(this.aiValuation.suggestions)
        ? this.aiValuation.suggestions.filter(Boolean)
        : []
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
    formatMoney(value) {
      const amount = Number(value)
      if (Number.isNaN(amount)) {
        return '0.00'
      }
      return amount.toFixed(2)
    },
    buildDraftPayload() {
      return {
        form: this.form,
        aiValuation: this.aiValuation,
        categoryTouched: this.categoryTouched
      }
    },
    saveDraft() {
      uni.setStorageSync(this.draftKey, this.buildDraftPayload())
    },
    restoreDraft() {
      const draft = uni.getStorageSync(this.draftKey)
      if (draft && typeof draft === 'object' && draft.form) {
        const merged = { ...createDefaultDraft(), ...draft }
        this.form = { ...createDefaultForm(), ...merged.form }
        this.aiValuation = merged.aiValuation || null
        this.categoryTouched = Boolean(merged.categoryTouched)
        return
      }

      this.form = draft && typeof draft === 'object' ? { ...createDefaultForm(), ...draft } : createDefaultForm()
      this.aiValuation = null
      this.categoryTouched = false
    },
    ensureLoggedIn() {
      if (this.authStore.sync().isLoggedIn()) {
        return true
      }

      uni.showToast({ title: '请先登录后再操作', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return false
    },
    fetchCategories() {
      getGoodsCategories()
        .then((res) => {
          if (res && res.code === 0 && Array.isArray(res.data) && res.data.length) {
            this.categories = res.data
            if (!this.form.categoryId) {
              this.form.categoryId = res.data[0].id
            }
            this.saveDraft()
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
              images: Array.isArray(res.data.images) && res.data.images.length ? res.data.images.slice(0, 9) : []
            }
            this.aiValuation = null
            this.categoryTouched = true
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
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.form.images = [...this.imageList, ...(res.tempFilePaths || [])].slice(0, 9)
          this.aiValuation = null
          this.saveDraft()
        }
      })
    },
    removeImage(index) {
      this.form.images = this.imageList.filter((item, currentIndex) => currentIndex !== index)
      this.aiValuation = null
      this.saveDraft()
    },
    selectCategory(item) {
      this.form.categoryId = item.id
      this.categoryTouched = true
      this.showCategoryPicker = false
      this.saveDraft()
    },
    selectCondition(item) {
      this.form.conditionLevel = item.value
      this.showConditionPicker = false
      this.saveDraft()
    },
    isUploadedImage(value) {
      return /^https?:\/\//.test(`${value || ''}`)
    },
    async uploadPendingImages() {
      const result = []
      for (let index = 0; index < this.imageList.length; index += 1) {
        const imagePath = this.imageList[index]
        if (this.isUploadedImage(imagePath)) {
          result.push(imagePath)
          continue
        }

        uni.showLoading({
          title: `上传图片 ${index + 1}/${this.imageList.length}`,
          mask: true
        })
        const res = await uploadGoodsImage(imagePath)
        if (!res || res.code !== 0 || !res.data || !res.data.url) {
          throw new Error((res && res.message) || '图片上传失败')
        }
        result.push(res.data.url)
      }
      this.form.images = result
      this.saveDraft()
      return result
    },
    mergeDescription(currentValue, appendValue) {
      const current = `${currentValue || ''}`.trim()
      const append = `${appendValue || ''}`.trim()
      if (!append) {
        return current
      }
      if (!current) {
        return append
      }
      if (current.includes(append)) {
        return current
      }
      return `${current}\n${append}`
    },
    async runAiValuation() {
      if (this.aiLoading) {
        return
      }
      if (!this.ensureLoggedIn()) {
        return
      }
      if (!this.imageList.length) {
        uni.showToast({ title: '请先上传商品图片', icon: 'none' })
        return
      }

      this.aiLoading = true
      try {
        const images = await this.uploadPendingImages()
        uni.showLoading({ title: 'AI 识别中', mask: true })
        const res = await createAiValuation({
          imageUrls: images.slice(0, 3),
          titleHint: (this.form.title || '').trim(),
          descriptionHint: (this.form.description || '').trim(),
          categoryIdHint: this.form.categoryId ? Number(this.form.categoryId) : null
        })

        if (res && res.code === 0 && res.data) {
          this.aiValuation = res.data
          this.saveDraft()
          uni.hideLoading()
          uni.showToast({ title: res.message || '识别成功', icon: 'success' })
          return
        }
        throw new Error((res && res.message) || 'AI 识别失败')
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: error && error.message ? error.message : 'AI 识别失败', icon: 'none' })
      } finally {
        uni.hideLoading()
        this.aiLoading = false
      }
    },
    async applyAiSuggestion() {
      if (!this.aiValuation || !this.aiValuation.fillSuggestion || this.applyingSuggestion) {
        return
      }
      if (!this.ensureLoggedIn()) {
        return
      }

      const fillSuggestion = this.aiValuation.fillSuggestion
      this.applyingSuggestion = true
      uni.showLoading({ title: '应用建议中', mask: true })

      try {
        if (this.aiValuation.valuationId) {
          const adoptRes = await adoptAiValuation(this.aiValuation.valuationId)
          if (adoptRes && adoptRes.code !== 0) {
            throw new Error(adoptRes.message || '应用建议失败')
          }
        }

        if (fillSuggestion.title) {
          this.form.title = fillSuggestion.title
        }
        if (fillSuggestion.price || fillSuggestion.price === 0) {
          this.form.price = this.formatMoney(fillSuggestion.price)
        }
        if (fillSuggestion.conditionLevel) {
          this.form.conditionLevel = clampConditionLevel(fillSuggestion.conditionLevel)
        }
        if (fillSuggestion.descriptionAppend) {
          this.form.description = this.mergeDescription(this.form.description, fillSuggestion.descriptionAppend)
        }

        const nextCategoryId = fillSuggestion.categoryId ? Number(fillSuggestion.categoryId) : null
        if (nextCategoryId) {
          if (!this.categoryTouched || String(this.form.categoryId) === String(nextCategoryId)) {
            this.form.categoryId = nextCategoryId
          } else if (this.aiValuation.categoryNameSuggest) {
            uni.showToast({
              title: `已保留当前分类，可参考 AI 建议：${this.aiValuation.categoryNameSuggest}`,
              icon: 'none'
            })
          }
        }

        this.aiValuation = {
          ...this.aiValuation,
          adopted: true
        }
        this.saveDraft()

        uni.hideLoading()
        uni.showToast({ title: '已回填 AI 建议', icon: 'success' })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: error && error.message ? error.message : '应用建议失败', icon: 'none' })
      } finally {
        uni.hideLoading()
        this.applyingSuggestion = false
      }
    },
    async submit() {
      if (this.submitting) {
        return
      }
      if (!this.ensureLoggedIn()) {
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

      this.submitting = true
      uni.showLoading({
        title: this.isEdit ? '保存中' : '发布中',
        mask: true
      })

      try {
        const images = await this.uploadPendingImages()
        const payload = {
          title: this.form.title.trim(),
          categoryId: Number(this.form.categoryId),
          conditionLevel: clampConditionLevel(this.form.conditionLevel),
          price,
          originalPrice,
          description: this.form.description.trim(),
          images
        }
        const action = this.isEdit ? () => updateGoods(this.id, payload) : () => createGoods(payload)
        const res = await action()

        if (res && res.code === 0 && res.data) {
          const targetId = res.data.id || this.id
          uni.removeStorageSync(this.draftKey)
          this.goodsStore.setLastViewedId(targetId)
          this.form = createDefaultForm()
          this.aiValuation = null
          this.categoryTouched = false
          uni.hideLoading()
          uni.showToast({ title: res.message || (this.isEdit ? '修改成功' : '发布成功'), icon: 'success' })
          setTimeout(() => {
            const query = this.isEdit ? `id=${targetId}` : `id=${targetId}&fromPublish=1`
            uni.redirectTo({ url: `/pages/goods/detail?${query}` })
          }, 260)
          return
        }
        throw new Error((res && res.message) || '提交失败')
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: error && error.message ? error.message : '提交失败', icon: 'none' })
      } finally {
        uni.hideLoading()
        this.submitting = false
      }
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
        uni.navigateBack({ delta: 1 })
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
  font-size: 32rpx;
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

.ai-card {
  background:
    radial-gradient(circle at top right, rgba(45, 106, 79, 0.12), transparent 32%),
    linear-gradient(180deg, #fbfdfc 0%, #f5faf7 100%);
  border: 1rpx solid rgba(45, 106, 79, 0.08);
}

.ai-row-head {
  align-items: flex-start;
}

.ai-trigger-btn,
.ai-secondary-btn,
.ai-primary-btn {
  margin: 0;
}

.ai-trigger-btn::after,
.ai-secondary-btn::after,
.ai-primary-btn::after {
  border: none;
}

.ai-trigger-btn {
  min-width: 168rpx;
  height: 68rpx;
  line-height: 68rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #2d6a4f;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 600;
}

.ai-trigger-btn[disabled] {
  opacity: 0.6;
}

.ai-tip {
  margin-top: 18rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #5f6f68;
  font-size: 22rpx;
  line-height: 1.7;
}

.ai-empty {
  margin-top: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.88);
  border: 2rpx dashed rgba(45, 106, 79, 0.14);
}

.ai-empty-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #244638;
}

.ai-empty-text {
  margin-top: 12rpx;
  font-size: 23rpx;
  line-height: 1.7;
  color: #6c757d;
}

.ai-result-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18rpx 36rpx rgba(36, 70, 56, 0.06);
}

.ai-result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.ai-item-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #213547;
  line-height: 1.35;
}

.ai-item-meta {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #73807a;
}

.ai-confidence-chip {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.confidence-high {
  background: #e8f5e9;
  color: #1b5e20;
}

.confidence-medium {
  background: #fff6e5;
  color: #b26a00;
}

.confidence-low {
  background: #fdecea;
  color: #c0392b;
}

.ai-metric-grid {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.ai-metric {
  padding: 18rpx;
  border-radius: 20rpx;
  background: #f7f9f8;
}

.ai-metric-label {
  font-size: 21rpx;
  color: #7f8c88;
}

.ai-metric-value {
  margin-top: 8rpx;
  font-size: 27rpx;
  font-weight: 700;
  color: #213547;
  line-height: 1.4;
}

.ai-price-range {
  color: #2f855a;
}

.ai-price-strong {
  color: #c26b00;
}

.ai-block {
  margin-top: 24rpx;
}

.ai-block-title {
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #2c3e50;
}

.ai-badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  min-height: 56rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  line-height: 1.5;
}

.ai-badge.danger {
  background: #fdecec;
  color: #c0392b;
}

.ai-list-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.ai-list-item + .ai-list-item {
  margin-top: 12rpx;
}

.ai-list-dot {
  width: 12rpx;
  height: 12rpx;
  margin-top: 12rpx;
  border-radius: 50%;
  background: #2d6a4f;
  flex-shrink: 0;
}

.ai-list-text {
  font-size: 23rpx;
  line-height: 1.7;
  color: #55636a;
}

.ai-note {
  margin-top: 24rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: #fff8e8;
  color: #8a6725;
  font-size: 22rpx;
  line-height: 1.7;
}

.ai-actions {
  margin-top: 24rpx;
  display: flex;
  gap: 16rpx;
}

.ai-secondary-btn,
.ai-primary-btn {
  flex: 1;
  height: 82rpx;
  line-height: 82rpx;
  border-radius: 18rpx;
  font-size: 26rpx;
}

.ai-secondary-btn {
  background: #edf3ef;
  color: #2d6a4f;
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

.submit-btn[disabled] {
  opacity: 0.72;
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
