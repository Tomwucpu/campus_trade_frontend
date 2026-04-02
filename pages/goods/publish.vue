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
          <view v-for="(item, index) in imageList" :key="`${item}-${index}`" class="image-item" @click="previewImages(index)">
            <image class="image-preview" :src="item" mode="aspectFill"></image>
            <view class="image-remove" @click.stop="removeImage(index)">×</view>
          </view>
          <view v-if="imageList.length < 9" class="image-uploader" @click="chooseImages">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片</text>
          </view>
        </view>

        <view class="ai-entry-row">
          <view class="ai-entry-copy">
            <view class="ai-entry-title">智能估价</view>
            <view class="ai-entry-caption">{{ aiEntryCaption }}</view>
          </view>
          <button
            class="ai-entry-btn"
            :class="{ active: aiPanelVisible }"
            size="mini"
            :loading="aiLoading"
            :disabled="aiLoading"
            @click="handleAiEntry"
          >
            <text class="ai-entry-label">{{ aiEntryText }}</text>
            <text class="ai-entry-arrow icon-font bi bi-chevron-down" :class="{ open: aiPanelVisible }"></text>
          </button>
        </view>

        <view class="ai-reveal" :class="{ open: aiPanelVisible }">
          <view class="ai-panel">
            <view class="ai-panel-head">
              <view>
                <view class="ai-panel-title">智能识别估价</view>
                <view class="ai-panel-subtitle">识别商品、成色和参考价格，结果仅供发布时参考。</view>
              </view>
              <view v-if="aiValuation" class="ai-confidence-chip" :class="`confidence-${aiValuation.confidenceLevel || 'medium'}`">
                {{ aiConfidenceText }}
              </view>
            </view>

            <view v-if="aiLoading" class="ai-loading-card">
              <view class="ai-loading-orb"></view>
              <view class="ai-loading-title">正在分析商品图片</view>
              <view class="ai-loading-text">会结合前 3 张代表图生成成色、分类和价格建议，请稍等片刻。</view>
            </view>

            <view v-else-if="!aiValuation" class="ai-empty">
              <view class="ai-empty-title">{{ aiEmptyTitle }}</view>
              <view class="ai-empty-text">{{ aiEmptyText }}</view>
            </view>

            <view v-else class="ai-result-card">
              <view class="ai-result-header">
                <view>
                  <view class="ai-item-name">{{ aiValuation.itemName || '未识别出具体商品' }}</view>
                  <view v-if="aiBrandModelText" class="ai-item-meta">{{ aiBrandModelText }}</view>
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
                价格会图片清晰度影响，请在发布前再手动确认一次。
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

      <view class="submit-actions">
        <button
          v-if="isCreateMode || isDraftMode"
          class="submit-draft-btn"
          :disabled="submitting || leaving"
          @click="handleSaveDraftTap"
        >
          {{ saveDraftButtonText }}
        </button>
        <button class="market-primary-btn submit-btn" :disabled="submitting" @click="submit">{{ submitButtonText }}</button>
      </view>
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
    <ImagePreviewer
      :visible="previewVisible"
      :images="imageList"
      :initial-index="previewIndex"
      @close="closePreview"
      @change="handlePreviewChange"
    />
  </view>
</template>

<script>
import {
  adoptAiValuation,
  createAiValuation,
  createGoods,
  createGoodsDraft,
  getGoodsCategories,
  getGoodsDetail,
  publishGoodsDraft,
  updateGoods,
  updateGoodsDraft,
  uploadGoodsImage
} from '../../api/goods'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import {
  getConditionOptions,
  getDefaultCategoryList,
  normalizeGoodsItem
} from '../../utils/market'
import ImagePreviewer from '../../components/ImagePreviewer.vue'
import { syncThemePage } from '../../utils/theme'

const MODE_CREATE = 'create'
const MODE_DRAFT = 'draft'
const MODE_EDIT = 'edit'
const UPLOAD_COMPRESS_THRESHOLD_BYTES = 1024 * 1024
const UPLOAD_MAX_LONG_EDGE = 1600

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

function clampConditionLevel(value) {
  const numeric = Number(value)
  if (!numeric || Number.isNaN(numeric)) {
    return 9
  }
  return Math.max(1, Math.min(10, Math.round(numeric)))
}

export default {
  components: {
    ImagePreviewer
  },
  data() {
    return {
      id: '',
      mode: MODE_CREATE,
      isEdit: false,
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      goodsStore: useGoodsStore(),
      form: createDefaultForm(),
      aiValuation: null,
      aiPanelVisible: false,
      aiErrorMessage: '',
      categoryTouched: false,
      categories: getDefaultCategoryList(),
      conditionOptions: getConditionOptions(),
      showCategoryPicker: false,
      showConditionPicker: false,
      previewVisible: false,
      previewIndex: 0,
      localImageMetaMap: {},
      aiLoading: false,
      applyingSuggestion: false,
      submitting: false,
      leaving: false,
      detailLoaded: false,
      lastSavedSnapshot: '',
      hasUnsavedChanges: false,
      editCapability: null,
      editWillAutoCancelPendingOrder: false
    }
  },
  computed: {
    isCreateMode() {
      return this.mode === MODE_CREATE
    },
    isDraftMode() {
      return this.mode === MODE_DRAFT
    },
    isPublishedEditMode() {
      return this.mode === MODE_EDIT
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
      if (this.isDraftMode) {
        return '继续发布'
      }
      return this.isPublishedEditMode ? '编辑商品' : '发布商品'
    },
    submitButtonText() {
      if (this.submitting) {
        return this.isPublishedEditMode ? '保存中...' : '发布中...'
      }
      if (this.isDraftMode) {
        return '立即发布'
      }
      return this.isPublishedEditMode ? '保存修改' : '立即发布'
    },
    saveDraftButtonText() {
      if (this.leaving || this.submitting) {
        return '保存中'
      }
      return '保存草稿'
    },
    submitTip() {
      if (this.isPublishedEditMode && this.editWillAutoCancelPendingOrder) {
        return '本次保存会自动取消当前商品的待付款订单，保存后商品会恢复在售状态。'
      }
      if (this.isDraftMode) {
        return '草稿发布前会执行完整校验，发布成功后会转为正式商品。'
      }
      return this.isPublishedEditMode
        ? '修改会立即同步到商品详情页，方便你继续调整描述和价格。'
        : '发布后会进入列表展示，图片会自动压缩进行展示。'
    },
    aiEntryText() {
      if (!this.imageList.length) {
        return '智能估价'
      }
      if (!this.aiValuation) {
        return this.aiErrorMessage ? '重新估价' : '智能估价'
      }
      return this.aiPanelVisible ? '收起估价' : '查看估价'
    },
    aiEntryCaption() {
      if (!this.imageList.length) {
        return '先上传商品图片，再使用智能估价。'
      }
      if (this.aiLoading) {
        return '正在分析图片，请稍等片刻。'
      }
      if (this.aiValuation) {
        return '已经生成一份价格建议，点开即可查看。'
      }
      if (this.aiErrorMessage) {
        return '上次识别失败，点击按钮即可重试。'
      }
      return '点击按钮即可生成成色、分类和价格建议。'
    },
    aiEmptyTitle() {
      return this.aiErrorMessage ? '这次识别没有成功' : '准备开始智能估价'
    },
    aiEmptyText() {
      return this.aiErrorMessage || '建议拍摄正面图、细节图和配件图，识别会优先读取前 3 张代表图。'
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
    this.mode = this.id ? MODE_EDIT : MODE_CREATE
    this.detailLoaded = false
    this.resetDirtyTracking()
    if (this.isEdit && !this.authStore.sync().isLoggedIn()) {
      uni.showToast({ title: '请先登录后再编辑商品', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
      return
    }
    this.fetchCategories()
    if (this.isEdit) {
      this.fetchDetail(true)
    }
  },
  onShow() {
    syncThemePage(this)
    if (this.isEdit && this.authStore.sync().isLoggedIn() && !this.detailLoaded) {
      this.fetchDetail(true)
    }
  },
  onBackPress() {
    if (this.previewVisible) {
      this.closePreview()
      return true
    }
    if (this.showCategoryPicker) {
      this.showCategoryPicker = false
      return true
    }
    if (this.showConditionPicker) {
      this.showConditionPicker = false
      return true
    }
    if (this.shouldPromptSaveOnLeave()) {
      this.handlePageExit()
      return true
    }
    return false
  },
  methods: {
    formatMoney(value) {
      const amount = Number(value)
      if (Number.isNaN(amount)) {
        return '0.00'
      }
      return amount.toFixed(2)
    },
    normalizeDecimalString(value) {
      const raw = `${value ?? ''}`.trim()
      if (!raw) {
        return ''
      }
      const numeric = Number(raw)
      return Number.isFinite(numeric) ? `${numeric}` : raw
    },
    buildFormSnapshot() {
      return JSON.stringify({
        title: (this.form.title || '').trim(),
        categoryId: this.form.categoryId ? Number(this.form.categoryId) : null,
        conditionLevel: this.form.conditionLevel ? clampConditionLevel(this.form.conditionLevel) : null,
        price: this.normalizeDecimalString(this.form.price),
        originalPrice: this.normalizeDecimalString(this.form.originalPrice),
        description: (this.form.description || '').trim(),
        images: this.imageList.filter(Boolean)
      })
    },
    resetDirtyTracking() {
      this.lastSavedSnapshot = this.buildFormSnapshot()
      this.hasUnsavedChanges = false
    },
    saveDraft() {
      this.hasUnsavedChanges = this.buildFormSnapshot() !== this.lastSavedSnapshot
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
    showLeaveActionSheet() {
      return new Promise((resolve) => {
        uni.showActionSheet({
          itemList: ['保存到草稿并离开', '直接离开'],
          success: ({ tapIndex }) => resolve(tapIndex),
          fail: () => resolve(-1)
        })
      })
    },
    shouldPromptSaveOnLeave() {
      return (this.isCreateMode || this.isDraftMode) && this.hasUnsavedChanges
    },
    fetchCategories() {
      getGoodsCategories()
        .then((res) => {
          if (res && res.code === 0 && Array.isArray(res.data) && res.data.length) {
            this.categories = res.data
            const hasCurrentCategory = this.categories.some((item) => String(item.id) === String(this.form.categoryId))
            if (!hasCurrentCategory) {
              this.form.categoryId = res.data[0].id
            }
            if (!this.id && !this.hasUnsavedChanges) {
              this.resetDirtyTracking()
            } else {
              this.saveDraft()
            }
          }
        })
        .catch(() => {})
    },
    applyDetailToForm(rawDetail = {}) {
      const detail = normalizeGoodsItem(rawDetail, 0)
      this.editCapability = detail
      this.editWillAutoCancelPendingOrder = detail.status !== 'DRAFT' && detail.hasPendingPaymentOrder === true
      this.mode = detail.status === 'DRAFT' ? MODE_DRAFT : MODE_EDIT
      this.form = {
        ...createDefaultForm(),
        title: detail.title || '',
        categoryId: detail.categoryId || this.form.categoryId || 1,
        conditionLevel: Number(detail.conditionLevel) || 9,
        price: detail.priceValue ? String(detail.priceValue) : '',
        originalPrice: detail.originalPriceValue ? String(detail.originalPriceValue) : '',
        description: detail.description || '',
        images: Array.isArray(rawDetail.images) ? rawDetail.images.slice(0, 9) : []
      }
      this.aiValuation = null
      this.aiPanelVisible = false
      this.aiErrorMessage = ''
      this.categoryTouched = true
      this.localImageMetaMap = {}
      this.detailLoaded = true
      this.resetDirtyTracking()
      return detail
    },
    fetchDetail(syncForm = true) {
      getGoodsDetail(this.id)
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            const detail = normalizeGoodsItem(res.data, 0)
            if (detail.status !== 'DRAFT' && detail.canEdit === false) {
              this.editCapability = detail
              this.editWillAutoCancelPendingOrder = detail.hasPendingPaymentOrder === true
              uni.showModal({
                title: '当前不可编辑',
                content: detail.editBlockedReason || '当前状态暂不支持编辑商品',
                showCancel: false,
                success: () => {
                  this.performBackNavigation()
                }
              })
              return
            }
            if (!syncForm) {
              this.editCapability = detail
              this.editWillAutoCancelPendingOrder = detail.status !== 'DRAFT' && detail.hasPendingPaymentOrder === true
              this.mode = detail.status === 'DRAFT' ? MODE_DRAFT : MODE_EDIT
              this.detailLoaded = true
              return
            }
            this.applyDetailToForm(res.data)
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
          this.rememberLocalImageMeta(res.tempFiles)
          this.form.images = [...this.imageList, ...(res.tempFilePaths || [])].slice(0, 9)
          this.aiValuation = null
          this.aiPanelVisible = false
          this.aiErrorMessage = ''
          this.saveDraft()
        }
      })
    },
    removeImage(index) {
      const removedImage = this.imageList[index]
      this.form.images = this.imageList.filter((item, currentIndex) => currentIndex !== index)
      this.forgetLocalImageMeta(removedImage)
      this.aiValuation = null
      this.aiPanelVisible = false
      this.aiErrorMessage = ''
      this.saveDraft()
    },
    previewImages(index = 0) {
      const urls = this.imageList.filter(Boolean)
      if (!urls.length) {
        return
      }
      this.previewIndex = urls[index] ? index : 0
      this.previewVisible = true
    },
    handlePreviewChange(index = 0) {
      this.previewIndex = index
    },
    closePreview() {
      this.previewVisible = false
    },
    handleAiEntry() {
      if (this.aiLoading) {
        return
      }
      if (!this.imageList.length) {
        uni.showToast({ title: '请先上传商品图片', icon: 'none' })
        return
      }
      if (!this.aiValuation) {
        this.runAiValuation()
        return
      }
      this.aiPanelVisible = !this.aiPanelVisible
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
    rememberLocalImageMeta(fileList = []) {
      if (!Array.isArray(fileList) || !fileList.length) {
        return
      }
      const nextMeta = {}
      fileList.forEach((file) => {
        const path = file && (file.path || file.tempFilePath)
        if (!path) {
          return
        }
        nextMeta[path] = {
          size: Number(file.size) || 0
        }
      })
      if (!Object.keys(nextMeta).length) {
        return
      }
      this.localImageMetaMap = {
        ...this.localImageMetaMap,
        ...nextMeta
      }
    },
    forgetLocalImageMeta(filePath) {
      if (!filePath || !this.localImageMetaMap[filePath]) {
        return
      }
      const nextMeta = { ...this.localImageMetaMap }
      delete nextMeta[filePath]
      this.localImageMetaMap = nextMeta
    },
    getLocalImageInfo(filePath) {
      return new Promise((resolve, reject) => {
        uni.getImageInfo({
          src: filePath,
          success: resolve,
          fail: reject
        })
      })
    },
    getLocalImageSize(filePath) {
      const cached = this.localImageMetaMap[filePath]
      if (cached && Number(cached.size) > 0) {
        return Promise.resolve(Number(cached.size))
      }

      // #ifdef H5
      return Promise.resolve(0)
      // #endif

      // #ifndef H5
      return new Promise((resolve) => {
        uni.getFileInfo({
          filePath,
          success: (res) => {
            const size = Number((res && res.size) || 0)
            if (size > 0) {
              this.rememberLocalImageMeta([{ path: filePath, size }])
            }
            resolve(size)
          },
          fail: () => resolve(0)
        })
      })
      // #endif
    },
    needsUploadCompression(imageInfo = {}, fileSize = 0) {
      const longEdge = Math.max(Number(imageInfo.width) || 0, Number(imageInfo.height) || 0)
      return longEdge > UPLOAD_MAX_LONG_EDGE || Number(fileSize || 0) > UPLOAD_COMPRESS_THRESHOLD_BYTES
    },
    compressUploadImage(filePath, imageInfo = {}) {
      // #ifdef H5
      return Promise.resolve(filePath)
      // #endif
    },
    async prepareUploadImage(filePath) {
      if (!filePath || this.isUploadedImage(filePath)) {
        return filePath
      }
      try {
        const [imageInfo, fileSize] = await Promise.all([
          this.getLocalImageInfo(filePath),
          this.getLocalImageSize(filePath)
        ])
        if (!this.needsUploadCompression(imageInfo, fileSize)) {
          return filePath
        }
        return await this.compressUploadImage(filePath, imageInfo)
      } catch (error) {
        return filePath
      }
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
        const preparedImagePath = await this.prepareUploadImage(imagePath)
        const res = await uploadGoodsImage(preparedImagePath)
        if (!res || res.code !== 0 || !res.data || !res.data.url) {
          throw new Error((res && res.message) || '图片上传失败')
        }
        this.forgetLocalImageMeta(imagePath)
        if (preparedImagePath !== imagePath) {
          this.forgetLocalImageMeta(preparedImagePath)
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

      this.aiPanelVisible = true
      this.aiErrorMessage = ''
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
          this.aiErrorMessage = ''
          this.saveDraft()
          uni.hideLoading()
          uni.showToast({ title: res.message || '识别成功', icon: 'success' })
          return
        }
        throw new Error((res && res.message) || 'AI 识别失败')
      } catch (error) {
        this.aiErrorMessage = error && error.message ? error.message : 'AI 识别失败'
        uni.hideLoading()
        uni.showToast({ title: this.aiErrorMessage, icon: 'none' })
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
    normalizeOptionalNumber(value) {
      const raw = `${value ?? ''}`.trim()
      if (!raw) {
        return null
      }
      const numeric = Number(raw)
      return Number.isFinite(numeric) ? numeric : null
    },
    buildDraftPayload(images) {
      return {
        title: (this.form.title || '').trim(),
        categoryId: this.form.categoryId ? Number(this.form.categoryId) : null,
        conditionLevel: this.form.conditionLevel ? clampConditionLevel(this.form.conditionLevel) : null,
        price: this.normalizeOptionalNumber(this.form.price),
        originalPrice: this.normalizeOptionalNumber(this.form.originalPrice),
        description: (this.form.description || '').trim(),
        images
      }
    },
    buildPublishPayload(images) {
      return {
        title: (this.form.title || '').trim(),
        categoryId: Number(this.form.categoryId),
        conditionLevel: clampConditionLevel(this.form.conditionLevel),
        price: Number(this.form.price),
        originalPrice: this.normalizeOptionalNumber(this.form.originalPrice),
        description: (this.form.description || '').trim(),
        images
      }
    },
    async persistDraftToServer(options = {}) {
      if (!this.ensureLoggedIn()) {
        throw new Error('请先登录后再保存草稿')
      }
      const { loadingTitle = '保存草稿中', showLoading = true } = options
      if (showLoading) {
        uni.showLoading({ title: loadingTitle, mask: true })
      }
      try {
        const images = await this.uploadPendingImages()
        const payload = this.buildDraftPayload(images)
        const action = this.isDraftMode && this.id
          ? () => updateGoodsDraft(this.id, payload)
          : () => createGoodsDraft(payload)
        const res = await action()
        if (!res || res.code !== 0 || !res.data) {
          throw new Error((res && res.message) || '保存草稿失败')
        }
        this.id = `${res.data.id || this.id || ''}`
        this.isEdit = Boolean(this.id)
        this.applyDetailToForm(res.data)
        return res.data
      } finally {
        if (showLoading) {
          uni.hideLoading()
        }
      }
    },
    async handleSaveDraftTap() {
      if (this.submitting || this.leaving || this.isPublishedEditMode) {
        return
      }
      if (this.isDraftMode && !this.hasUnsavedChanges) {
        uni.showToast({ title: '草稿已是最新', icon: 'none' })
        return
      }
      try {
        const savedDraft = await this.persistDraftToServer({ loadingTitle: '保存草稿中', showLoading: true })
        if (!savedDraft) {
          return
        }
        uni.showToast({ title: '草稿已保存', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: error && error.message ? error.message : '保存草稿失败', icon: 'none' })
      }
    },
    async handlePageExit() {
      if (this.leaving || this.submitting) {
        return
      }
      this.leaving = true
      try {
        if (this.shouldPromptSaveOnLeave()) {
          const actionIndex = await this.showLeaveActionSheet()
          if (actionIndex === 0) {
            try {
              await this.persistDraftToServer({ loadingTitle: '保存草稿中', showLoading: true })
            } catch (error) {
              uni.showToast({ title: error && error.message ? error.message : '保存草稿失败', icon: 'none' })
              return
            }
          } else if (actionIndex !== 1) {
            return
          }
        }
        this.performBackNavigation()
      } finally {
        this.leaving = false
      }
    },
    async submit() {
      if (this.submitting) {
        return
      }
      if (!this.ensureLoggedIn()) {
        return
      }
      if (this.isPublishedEditMode && this.editCapability && this.editCapability.canEdit === false) {
        uni.showToast({
          title: this.editCapability.editBlockedReason || '当前状态暂不支持编辑商品',
          icon: 'none'
        })
        return
      }

      if (!this.form.title || !this.form.price || !this.form.description) {
        uni.showToast({ title: '请补全标题、价格和描述', icon: 'none' })
        return
      }

      const price = Number(this.form.price)
      const originalPrice = this.normalizeOptionalNumber(this.form.originalPrice)
      if (!price || Number.isNaN(price) || price <= 0) {
        uni.showToast({ title: '请输入正确的出售价格', icon: 'none' })
        return
      }
      if (originalPrice !== null && (Number.isNaN(originalPrice) || originalPrice < 0)) {
        uni.showToast({ title: '请输入正确的原价', icon: 'none' })
        return
      }

      if (this.isPublishedEditMode && this.editWillAutoCancelPendingOrder) {
        const confirmed = await this.showActionConfirm(
          '保存修改',
          '保存后会自动取消当前商品的待付款订单，并将商品恢复为在售状态，确认继续吗？'
        )
        if (!confirmed) {
          return
        }
      }

      this.submitting = true
      uni.showLoading({
        title: this.isPublishedEditMode ? '保存中' : '发布中',
        mask: true
      })

      try {
        const images = await this.uploadPendingImages()
        let res = null
        if (this.isCreateMode) {
          res = await createGoods(this.buildPublishPayload(images))
        } else if (this.isDraftMode) {
          const saveRes = await updateGoodsDraft(this.id, this.buildDraftPayload(images))
          if (!saveRes || saveRes.code !== 0) {
            throw new Error((saveRes && saveRes.message) || '草稿同步失败')
          }
          this.applyDetailToForm(saveRes.data || {})
          res = await publishGoodsDraft(this.id)
        } else {
          res = await updateGoods(this.id, this.buildPublishPayload(images))
        }

        if (res && res.code === 0 && res.data) {
          const targetId = res.data.id || this.id
          const wasEditMode = this.isPublishedEditMode
          this.goodsStore.setLastViewedId(targetId)
          this.form = createDefaultForm()
          this.aiValuation = null
          this.aiPanelVisible = false
          this.aiErrorMessage = ''
          this.categoryTouched = false
          this.localImageMetaMap = {}
          this.detailLoaded = false
          this.mode = MODE_CREATE
          this.resetDirtyTracking()
          uni.hideLoading()
          uni.showToast({ title: res.message || (wasEditMode ? '修改成功' : '发布成功'), icon: 'success' })
          setTimeout(() => {
            const query = wasEditMode ? `id=${targetId}` : `id=${targetId}&fromPublish=1`
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
    performBackNavigation() {
      const pages = getCurrentPages()
      if (Array.isArray(pages) && pages.length > 1) {
        uni.navigateBack({ delta: 1 })
        return
      }
      uni.reLaunch({ url: '/pages/index/index' })
    },
    goBack() {
      if (this.previewVisible) {
        this.closePreview()
        return
      }
      if (this.showCategoryPicker) {
        this.showCategoryPicker = false
        return
      }
      if (this.showConditionPicker) {
        this.showConditionPicker = false
        return
      }
      this.handlePageExit()
    }
  }
}
</script>

<style scoped>
.publish-page {
  --publish-border: rgba(216, 209, 196, 0.9);
  --publish-border-strong: rgba(165, 153, 137, 0.4);
  --publish-surface: rgba(248, 244, 238, 0.96);
  --publish-surface-soft: rgba(255, 255, 255, 0.9);
  --publish-muted: var(--campus-text-muted);
  --publish-muted-light: var(--campus-text-light);
  --publish-accent: var(--campus-primary);
  --publish-accent-strong: var(--campus-primary-strong);
  --publish-accent-soft: rgba(39, 35, 30, 0.08);
  --publish-price: var(--campus-orange);
  --publish-danger: var(--campus-danger);
  --publish-danger-soft: var(--campus-danger-soft);
  padding-bottom: calc(76rpx + env(safe-area-inset-bottom));
}

.publish-topbar {
  margin-bottom: 24rpx;
  padding: 8rpx 0;
  opacity: 0;
  transform: translateY(-12rpx);
  animation: publishTopbarIn 420ms cubic-bezier(0.22, 1, 0.36, 1) 80ms forwards;
}

.publish-topbar .market-back-btn {
  transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.publish-topbar .market-back-btn:active {
  transform: scale(0.9);
  background: rgba(233, 227, 217, 0.88);
  box-shadow: 0 10rpx 18rpx rgba(45, 39, 31, 0.14);
}

.placeholder-btn {
  opacity: 0;
  pointer-events: none;
}

.save-draft-btn {
  min-width: 132rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 24rpx;
  border: 1rpx solid var(--publish-border);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.9);
  color: var(--publish-accent-strong);
  font-size: 22rpx;
  font-weight: 700;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.save-draft-btn::after {
  border: none;
}

.save-draft-btn:active {
  transform: scale(0.96);
  box-shadow: 0 8rpx 16rpx rgba(45, 39, 31, 0.12);
}

.save-draft-btn[disabled] {
  opacity: 0.6;
}

.publish-card {
  padding: 24rpx;
  margin-bottom: 22rpx;
  border-radius: 30rpx;
  background: var(--publish-surface);
  border: 1rpx solid var(--publish-border);
  box-shadow: 0 16rpx 30rpx rgba(45, 39, 31, 0.08);
  opacity: 0;
  transform: translateY(24rpx) scale(0.99);
  animation: publishCardIn 460ms cubic-bezier(0.2, 0.78, 0.22, 1) forwards;
}

.publish-card + .publish-card {
  animation-delay: 90ms;
}

.image-count {
  min-width: 88rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: var(--publish-muted);
  background: rgba(243, 239, 230, 0.88);
  border: 1rpx solid var(--publish-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  border: 1rpx solid var(--publish-border);
  box-shadow: 0 12rpx 22rpx rgba(45, 39, 31, 0.08);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}

.image-item:active,
.image-uploader:active {
  transform: translateY(2rpx) scale(0.98);
  box-shadow: 0 6rpx 14rpx rgba(45, 39, 31, 0.12);
  border-color: var(--publish-border-strong);
}

.image-preview {
  width: 100%;
  height: 100%;
  transition: transform 320ms ease;
}

.image-item:active .image-preview {
  transform: scale(1.04);
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
  transform: scale(1);
  transition: transform 180ms ease, background-color 180ms ease;
}

.image-remove:active {
  transform: scale(0.9);
  background: rgba(0, 0, 0, 0.75);
}

.image-uploader {
  border: 2rpx dashed var(--publish-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(244, 240, 233, 0.92) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.upload-icon {
  font-size: 44rpx;
  color: var(--publish-accent);
  animation: uploaderFloat 2.8s ease-in-out infinite;
}

.upload-text {
  font-size: 22rpx;
  color: var(--publish-muted);
}

.ai-entry-row {
  margin-top: 22rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18rpx;
}

.ai-entry-copy {
  flex: 1;
  min-width: 0;
}

.ai-entry-title {
  font-size: 25rpx;
  font-weight: 700;
  color: var(--publish-accent-strong);
}

.ai-entry-caption {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: var(--publish-muted);
}

.ai-entry-btn,
.ai-secondary-btn,
.ai-primary-btn {
  margin: 0;
}

.ai-entry-btn::after,
.ai-secondary-btn::after,
.ai-primary-btn::after {
  border: none;
}

.ai-entry-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-width: 188rpx;
  height: 74rpx;
  line-height: 74rpx;
  padding: 0 26rpx 0 30rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #3d362f 0%, #27231e 100%);
  box-shadow: 0 14rpx 28rpx rgba(39, 35, 30, 0.24);
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
  transform: translateY(0);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    opacity 220ms ease;
}

.ai-entry-btn[disabled] {
  opacity: 0.66;
}

.ai-entry-btn.active {
  transform: translateY(-4rpx);
  box-shadow: 0 20rpx 38rpx rgba(39, 35, 30, 0.28);
}

.ai-entry-btn:active {
  transform: translateY(2rpx) scale(0.97);
  box-shadow: 0 8rpx 18rpx rgba(39, 35, 30, 0.24);
}

.ai-entry-label {
  white-space: nowrap;
}

.ai-entry-arrow {
  font-size: 24rpx;
  transform: rotate(0deg);
  transform-origin: center;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ai-entry-arrow.open {
  transform: rotate(180deg);
}

.ai-reveal {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  transform: translateY(-18rpx);
  transform-origin: top center;
  transition:
    max-height 380ms cubic-bezier(0.22, 1, 0.36, 1),
    margin-top 320ms ease,
    opacity 220ms ease,
    transform 320ms ease;
}

.ai-reveal.open {
  max-height: 4000rpx;
  margin-top: 22rpx;
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.ai-panel {
  padding: 26rpx;
  border-radius: 28rpx;
  background:
    radial-gradient(circle at top right, rgba(39, 35, 30, 0.09), transparent 38%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 241, 234, 0.94) 100%);
  border: 1rpx solid var(--publish-border);
  box-shadow: 0 16rpx 34rpx rgba(45, 39, 31, 0.08);
}

.ai-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.ai-panel-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--publish-accent-strong);
}

.ai-panel-subtitle {
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--publish-muted);
}

.ai-loading-card,
.ai-empty {
  margin-top: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 22rpx;
  background: var(--publish-surface-soft);
  border: 2rpx solid rgba(216, 209, 196, 0.58);
}

.ai-loading-card {
  position: relative;
  overflow: hidden;
}

.ai-loading-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent);
  transform: translateX(-100%);
  animation: aiShimmer 1.6s linear infinite;
}

.ai-loading-orb {
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0) 35%),
    linear-gradient(135deg, #2f2a24 0%, #7d7367 100%);
  box-shadow: 0 14rpx 28rpx rgba(45, 39, 31, 0.22);
  animation: aiPulse 1.8s ease-in-out infinite;
}

.ai-loading-title {
  position: relative;
  z-index: 1;
  margin-top: 18rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--publish-accent-strong);
}

.ai-loading-text {
  position: relative;
  z-index: 1;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--publish-muted);
}

.ai-empty-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--publish-accent-strong);
}

.ai-empty-text {
  margin-top: 12rpx;
  font-size: 23rpx;
  line-height: 1.7;
  color: var(--publish-muted);
}

.ai-result-card {
  margin-top: 20rpx;
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
  color: var(--campus-text);
  line-height: 1.35;
}

.ai-item-meta {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: var(--publish-muted);
}

.ai-confidence-chip {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.confidence-high {
  background: #eef6eb;
  color: #2f6042;
}

.confidence-medium {
  background: #fdf3e5;
  color: #9c6221;
}

.confidence-low {
  background: #f9e6e3;
  color: #aa463a;
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
  background: rgba(255, 255, 255, 0.78);
  border: 1rpx solid var(--publish-border);
  transition: transform 220ms ease, box-shadow 220ms ease;
}

.ai-metric:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 14rpx rgba(45, 39, 31, 0.08);
}

.ai-metric-label {
  font-size: 21rpx;
  color: var(--publish-muted);
}

.ai-metric-value {
  margin-top: 8rpx;
  font-size: 27rpx;
  font-weight: 700;
  color: var(--campus-text);
  line-height: 1.4;
}

.ai-price-range {
  color: var(--publish-accent);
}

.ai-price-strong {
  color: var(--publish-price);
}

.ai-block {
  margin-top: 24rpx;
}

.ai-block-title {
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--campus-text);
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
  border: 1rpx solid transparent;
}

.ai-badge.danger {
  background: var(--publish-danger-soft);
  color: var(--publish-danger);
  border-color: rgba(171, 67, 56, 0.18);
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
  background: var(--publish-accent);
  flex-shrink: 0;
}

.ai-list-text {
  font-size: 23rpx;
  line-height: 1.7;
  color: #5a5247;
}

.ai-note {
  margin-top: 24rpx;
  padding: 18rpx 20rpx;
  border-radius: 18rpx;
  background: #fff5e5;
  color: #856234;
  font-size: 22rpx;
  line-height: 1.7;
  border: 1rpx solid rgba(201, 172, 120, 0.26);
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
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.ai-secondary-btn {
  background: rgba(243, 239, 230, 0.92);
  color: #6b6459;
  border: 1rpx solid var(--publish-border);
}

.ai-secondary-btn:active,
.ai-primary-btn:active {
  transform: translateY(2rpx) scale(0.98);
}

.field-group {
  margin-top: 16rpx;
}

.field-inline {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-top: 0;
}

.field-group.half {
  flex: 1;
  min-width: 0;
}

.field-label {
  font-size: 24rpx;
  color: var(--campus-text);
  margin-bottom: 14rpx;
  font-weight: 700;
}

.publish-card .market-input,
.publish-card .market-textarea {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--publish-border);
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease;
}

.publish-card .market-input:focus,
.publish-card .market-textarea:focus {
  background: #ffffff;
  border-color: var(--publish-border-strong);
  box-shadow: 0 0 0 6rpx var(--publish-accent-soft);
}

.field-count {
  margin-top: 10rpx;
  text-align: right;
  font-size: 21rpx;
  color: var(--publish-muted-light);
}

.select-field {
  min-height: 90rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid var(--publish-border);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--campus-text);
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    transform 220ms ease,
    background-color 220ms ease;
}

.select-field:active {
  transform: translateY(2rpx);
  background: rgba(249, 246, 240, 0.96);
  border-color: var(--publish-border-strong);
  box-shadow: 0 8rpx 14rpx rgba(45, 39, 31, 0.07);
}

.select-field .placeholder {
  color: var(--publish-muted-light);
}

.select-arrow {
  font-size: 30rpx;
  color: var(--publish-muted-light);
  transition: transform 220ms ease, color 220ms ease;
}

.select-field:active .select-arrow {
  transform: translateX(4rpx);
  color: var(--publish-muted);
}

.price-shell {
  min-height: 90rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid var(--publish-border);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    transform 220ms ease,
    background-color 220ms ease;
}

.price-shell:focus-within {
  background: #ffffff;
  border-color: var(--publish-border-strong);
  box-shadow: 0 0 0 6rpx var(--publish-accent-soft);
}

.price-shell:active {
  transform: translateY(2rpx);
}

.price-symbol {
  font-size: 28rpx;
  color: var(--publish-muted);
  margin-right: 10rpx;
}

.price-value {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: var(--campus-text);
}

.submit-actions {
  display: flex;
  align-items: stretch;
  gap: 18rpx;
}

.submit-draft-btn {
  flex: 1 1 0;
  min-width: 0;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 24rpx;
  border: 1rpx solid var(--publish-border);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.94);
  color: var(--publish-accent-strong);
  font-size: 28rpx;
  font-weight: 700;
  opacity: 0;
  transform: translateY(18rpx);
  animation: publishSubmitIn 420ms cubic-bezier(0.22, 1, 0.36, 1) 170ms forwards;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.submit-draft-btn::after {
  border: none;
}

.submit-draft-btn:active {
  transform: translateY(2rpx) scale(0.985);
  box-shadow: 0 6rpx 14rpx rgba(39, 35, 30, 0.12);
}

.submit-draft-btn[disabled] {
  opacity: 0.6;
}

.submit-btn {
  flex: 1 1 0;
  min-width: 0;
  border-radius: 20rpx;
  height: 88rpx;
  line-height: 88rpx;
  opacity: 0;
  transform: translateY(18rpx);
  animation: publishSubmitIn 420ms cubic-bezier(0.22, 1, 0.36, 1) 170ms forwards;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.submit-btn:active {
  transform: translateY(2rpx) scale(0.985);
  box-shadow: 0 6rpx 14rpx rgba(39, 35, 30, 0.24);
}

.submit-btn[disabled] {
  opacity: 0.72;
}

.submit-tip {
  margin-top: 18rpx;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--publish-muted);
  opacity: 0;
  transform: translateY(12rpx);
  animation: publishSubmitIn 380ms ease 220ms forwards;
}

.picker-mask {
  position: fixed;
  inset: 0;
  background: rgba(28, 24, 19, 0.36);
  backdrop-filter: blur(4rpx);
  display: flex;
  align-items: flex-end;
  z-index: 40;
  opacity: 0;
  animation: pickerMaskIn 220ms ease forwards;
}

.picker-sheet {
  width: 100%;
  background: #f7f4ee;
  border-radius: 32rpx 32rpx 0 0;
  border-top: 1rpx solid var(--publish-border);
  padding: 30rpx 24rpx calc(42rpx + env(safe-area-inset-bottom));
  transform: translateY(40rpx);
  animation: pickerSheetIn 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.picker-title {
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--campus-text);
  margin-bottom: 22rpx;
}

.picker-item {
  min-height: 82rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid var(--publish-border);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  color: var(--campus-text);
  font-size: 25rpx;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.picker-item + .picker-item {
  margin-top: 12rpx;
}

.picker-item:active {
  transform: scale(0.985);
  border-color: var(--publish-border-strong);
}

.picker-item.active {
  background: rgba(39, 35, 30, 0.09);
  color: var(--publish-accent-strong);
  border-color: rgba(39, 35, 30, 0.26);
}

@keyframes publishTopbarIn {
  from {
    opacity: 0;
    transform: translateY(-12rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes publishCardIn {
  from {
    opacity: 0;
    transform: translateY(24rpx) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes publishSubmitIn {
  from {
    opacity: 0;
    transform: translateY(14rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes uploaderFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5rpx);
  }
}

@keyframes aiPulse {
  0%,
  100% {
    transform: scale(0.94);
    box-shadow: 0 14rpx 28rpx rgba(45, 39, 31, 0.22);
  }
  50% {
    transform: scale(1);
    box-shadow: 0 18rpx 34rpx rgba(45, 39, 31, 0.28);
  }
}

@keyframes aiShimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pickerMaskIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pickerSheetIn {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 360px) {
  .field-inline {
    flex-direction: column;
    gap: 0;
  }

  .field-group.half + .field-group.half {
    margin-top: 16rpx;
  }
}

@media (prefers-reduced-motion: reduce) {
  .publish-topbar,
  .publish-card,
  .submit-draft-btn,
  .submit-btn,
  .submit-tip,
  .upload-icon,
  .ai-loading-card::after,
  .ai-loading-orb,
  .picker-mask,
  .picker-sheet {
    animation: none !important;
  }

  .publish-topbar,
  .publish-card,
  .submit-draft-btn,
  .submit-btn,
  .submit-tip {
    opacity: 1;
    transform: none;
  }

  .ai-entry-btn,
  .ai-entry-arrow,
  .ai-reveal,
  .image-item,
  .image-uploader,
  .ai-metric,
  .ai-secondary-btn,
  .ai-primary-btn,
  .select-field,
  .price-shell,
  .picker-item {
    transition: none !important;
  }
}
</style>
