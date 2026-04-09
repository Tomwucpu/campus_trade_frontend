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
            <view class="market-section-subtitle">最多上传 9 张，AI 只识别前三张。</view>
          </view>
          <view class="image-count">{{ imageList.length }}/9</view>
        </view>

        <view class="image-grid">
          <view v-for="(item, index) in imageList" :key="`${item}-${index}`" class="image-item">
            <view class="image-order-chip" :class="{ active: index === 0 }">{{ index === 0 ? '首图' : `第${index + 1}张` }}</view>
            <image class="image-preview" :src="item" mode="aspectFill" @click="previewImages(index)"></image>
            <view class="image-actions" @click.stop>
              <view
                class="image-sort-btn"
                :class="{ active: index === 0, disabled: index === 0 }"
                @click.stop="moveImageToFirst(index)"
              >
                首图
              </view>
              <view class="image-sort-btn" :class="{ disabled: index === 0 }" @click.stop="moveImageLeft(index)">左移</view>
              <view
                class="image-sort-btn"
                :class="{ disabled: index === imageList.length - 1 }"
                @click.stop="moveImageRight(index)"
              >
                右移
              </view>
            </view>
            <view class="image-remove" @click.stop="removeImage(index)">×</view>
          </view>
          <view v-if="imageList.length < 9" class="image-uploader" @click="chooseImages">
            <text class="upload-icon">+</text>
            <text class="upload-text">上传图片</text>
          </view>
        </view>

        <GoodsAiValuationPanel
          :images="imageList"
          :description-hint="form.description"
          :category-id-hint="form.categoryId"
          :category-touched="categoryTouched"
          :prepare-ai-images="prepareAiImages"
          :ensure-logged-in="ensureLoggedIn"
          :reset-version="aiResetVersion"
          @apply-suggestion="handleAiSuggestionApply"
        />
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

        <view class="field-group">
          <view class="field-label">当前发布校区</view>
          <CampusBindingWidget
            variant="readonly"
            mode="readonly"
            tone="publish"
            :display-name="publishCampusName || '暂未绑定校区'"
            :empty="!publishCampusName"
          />
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

    <view v-if="showImageInsertPicker" class="picker-mask" @click="closeImageInsertPicker">
      <view class="picker-sheet" @click.stop>
        <view class="picker-title">新图片插入位置</view>
        <view class="picker-subtitle">本次选中 {{ pendingInsertImages.length }} 张，发布和 AI 识别都会按这里的顺序处理。</view>
        <view
          v-for="item in imageInsertOptions"
          :key="item.value"
          class="picker-item"
          @click="applyPendingImages(item.value)"
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
  createGoods,
  createGoodsDraft,
  getGoodsCategories,
  getGoodsDetail,
  publishGoodsDraft,
  updateGoods,
  updateGoodsDraft,
  uploadAiValuationImage,
  uploadGoodsImage
} from '../../api/goods'
import { useAuthStore } from '../../store/auth'
import { useGoodsStore } from '../../store/goods'
import {
  getCampusDisplayName,
  hasBoundCampus
} from '../../utils/campus'
import CampusBindingWidget from '../../components/CampusBindingWidget.vue'
import {
  getConditionOptions,
  getDefaultCategoryList,
  normalizeGoodsItem
} from '../../utils/market'
import { insertImagesAt, moveImage } from '../../utils/image-order.mjs'
import GoodsAiValuationPanel from '../../components/GoodsAiValuationPanel.vue'
import ImagePreviewer from '../../components/ImagePreviewer.vue'
import { syncThemePage } from '../../utils/theme'

const MODE_CREATE = 'create'
const MODE_DRAFT = 'draft'
const MODE_EDIT = 'edit'
const MAX_IMAGE_COUNT = 9
const MAX_AI_IMAGE_COUNT = 3
const AI_SUGGESTION_KEYS = ['title', 'price', 'conditionLevel', 'description', 'categoryId']

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
    CampusBindingWidget,
    GoodsAiValuationPanel,
    ImagePreviewer
  },
  data() {
    return {
      id: '',
      mode: MODE_CREATE,
      theme: 'light',
      themeClass: 'theme-light',
      authStore: useAuthStore(),
      goodsStore: useGoodsStore(),
      isLoggedInValue: false,
      campusProfile: {},
      form: createDefaultForm(),
      aiResetVersion: 0,
      categoryTouched: false,
      categories: getDefaultCategoryList(),
      conditionOptions: getConditionOptions(),
      showCategoryPicker: false,
      showConditionPicker: false,
      showImageInsertPicker: false,
      previewVisible: false,
      previewIndex: 0,
      pendingInsertImages: [],
      aiUploadTokenMap: {},
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
    imageInsertOptions() {
      return Array.from({ length: this.imageList.length + 1 }, (_, index) => {
        if (index === 0) {
          return { value: index, label: '设为第 1 张（首图）' }
        }
        if (index === this.imageList.length) {
          return { value: index, label: `追加到末尾（从第 ${index + 1} 张开始）` }
        }
        return { value: index, label: `从第 ${index + 1} 张开始插入` }
      })
    },
    selectedCategoryName() {
      const current = this.categories.find((item) => String(item.id) === String(this.form.categoryId))
      if (current) {
        return current.name
      }
      if (this.editCapability && String(this.editCapability.categoryId) === String(this.form.categoryId)) {
        return this.editCapability.categoryLabel || ''
      }
      return ''
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
    hasCampusBound() {
      return hasBoundCampus(this.campusProfile)
    },
    publishCampusName() {
      if (this.isPublishedEditMode && this.editCapability && this.editCapability.campusName) {
        return this.editCapability.campusName
      }
      return getCampusDisplayName(this.campusProfile, '')
    },
    submitTip() {
      if (!this.isPublishedEditMode && !this.hasCampusBound) {
        return '请先前往个人页绑定账号校区，再将商品正式发布到对应校区流量池。'
      }
      if (this.isPublishedEditMode && this.editWillAutoCancelPendingOrder) {
        return '本次保存会自动取消当前商品的待付款订单，保存后商品会恢复在售状态。'
      }
      if (this.isDraftMode) {
        return '草稿发布前会执行完整校验，发布成功后会转为正式商品。'
      }
      return this.isPublishedEditMode
        ? '修改会立即同步到商品详情页，方便你继续调整描述和价格。'
        : '发布后会进入列表展示，图片会自动压缩进行展示。'
    }
  },
  onLoad(options) {
    syncThemePage(this)
    this.syncCampusState()
    this.id = (options && options.id) || ''
    this.mode = this.id ? MODE_EDIT : MODE_CREATE
    this.detailLoaded = false
    this.resetDirtyTracking()
    if (this.id && !this.authStore.sync().isLoggedIn()) {
      this.redirectToLogin('请先登录后再编辑商品')
      return
    }
    this.fetchCategories()
    if (this.id) {
      this.fetchDetail()
    }
  },
  onShow() {
    syncThemePage(this)
    this.syncCampusState()
    if (this.id && this.authStore.sync().isLoggedIn() && !this.detailLoaded) {
      this.fetchDetail()
    }
  },
  onBackPress() {
    if (this.closeTransientPanels()) {
      return true
    }
    if (this.shouldPromptSaveOnLeave()) {
      this.handlePageExit()
      return true
    }
    return false
  },
  methods: {
    syncCampusState() {
      const authStore = this.authStore.sync()
      this.isLoggedInValue = authStore.isLoggedIn()
      this.campusProfile = { ...(authStore.profile || {}) }
    },
    redirectToLogin(title = '请先登录后再操作') {
      uni.showToast({ title, icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/user/login' })
      }, 260)
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
    resetAiValuationModule() {
      this.aiResetVersion += 1
    },
    saveDraft() {
      this.hasUnsavedChanges = this.buildFormSnapshot() !== this.lastSavedSnapshot
    },
    handleAiSuggestionApply(patch = {}) {
      if (!patch || typeof patch !== 'object') {
        return
      }

      let hasPatch = false
      const nextForm = { ...this.form }
      AI_SUGGESTION_KEYS.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(patch, key)) {
          return
        }
        nextForm[key] = patch[key]
        hasPatch = true
      })

      if (hasPatch) {
        this.form = nextForm
        if (Object.prototype.hasOwnProperty.call(patch, 'categoryId')) {
          this.categoryTouched = true
        }
        this.saveDraft()
      }
    },
    ensureLoggedIn() {
      this.syncCampusState()
      if (this.isLoggedInValue) {
        return true
      }
      this.redirectToLogin('请先登录后再操作')
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
    goToProfileForCampusBinding() {
      uni.reLaunch({ url: '/pages/user/profile' })
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
    closeTransientPanels() {
      if (this.previewVisible) {
        this.closePreview()
        return true
      }
      if (this.showImageInsertPicker) {
        this.closeImageInsertPicker()
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
      return false
    },
    fetchCategories() {
      getGoodsCategories()
        .then((res) => {
          if (res && res.code === 0 && Array.isArray(res.data) && res.data.length) {
            const previousCategoryId = this.form.categoryId
            this.categories = res.data
            const hasCurrentCategory = this.categories.some((item) => String(item.id) === String(this.form.categoryId))
            if (!hasCurrentCategory && !this.id) {
              this.form.categoryId = res.data[0].id
            }
            if (!this.id && !this.hasUnsavedChanges) {
              this.resetDirtyTracking()
            } else if (String(previousCategoryId) !== String(this.form.categoryId)) {
              this.saveDraft()
            }
          }
        })
        .catch(() => {})
    },
    applyEditCapability(detail = {}) {
      this.editCapability = detail
      this.editWillAutoCancelPendingOrder = detail.status !== 'DRAFT' && detail.hasPendingPaymentOrder === true
    },
    applyDetailToForm(rawDetail = {}) {
      const detail = normalizeGoodsItem(rawDetail, 0)
      this.applyEditCapability(detail)
      this.mode = detail.status === 'DRAFT' ? MODE_DRAFT : MODE_EDIT
      this.form = {
        ...createDefaultForm(),
        title: detail.title || '',
        categoryId: detail.categoryId || this.form.categoryId || 1,
        conditionLevel: Number(detail.conditionLevel) || 9,
        price: detail.priceValue ? String(detail.priceValue) : '',
        originalPrice: detail.originalPriceValue ? String(detail.originalPriceValue) : '',
        description: detail.description || '',
        images: Array.isArray(rawDetail.images) ? rawDetail.images.slice(0, MAX_IMAGE_COUNT) : []
      }
      this.resetAiValuationModule()
      this.categoryTouched = true
      this.aiUploadTokenMap = {}
      this.detailLoaded = true
      this.resetDirtyTracking()
      return detail
    },
    fetchDetail() {
      getGoodsDetail(this.id)
        .then((res) => {
          if (res && res.code === 0 && res.data) {
            const detail = normalizeGoodsItem(res.data, 0)
            if (detail.status !== 'DRAFT' && detail.canEdit === false) {
              this.applyEditCapability(detail)
              this.detailLoaded = true
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
        count: MAX_IMAGE_COUNT - this.imageList.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.handleChosenImages(res.tempFilePaths || [])
        }
      })
    },
    handleChosenImages(tempFilePaths = []) {
      const nextImages = Array.isArray(tempFilePaths) ? tempFilePaths.filter(Boolean) : []
      if (!nextImages.length) {
        return
      }
      if (!this.imageList.length) {
        this.applyImageList(insertImagesAt(this.imageList, nextImages, 0, MAX_IMAGE_COUNT))
        return
      }
      this.pendingInsertImages = nextImages
      this.showImageInsertPicker = true
    },
    closeImageInsertPicker() {
      this.showImageInsertPicker = false
      this.pendingInsertImages = []
    },
    applyPendingImages(insertIndex) {
      if (!this.pendingInsertImages.length) {
        this.closeImageInsertPicker()
        return
      }
      this.applyImageList(insertImagesAt(this.imageList, this.pendingInsertImages, insertIndex, MAX_IMAGE_COUNT))
      this.closeImageInsertPicker()
    },
    applyImageList(nextImages = []) {
      this.form.images = Array.isArray(nextImages) ? nextImages.slice(0, MAX_IMAGE_COUNT) : []
      this.resetAiValuationModule()
      this.saveDraft()
    },
    moveImageToFirst(index) {
      if (index <= 0) {
        return
      }
      this.applyImageList(moveImage(this.imageList, index, 0))
    },
    moveImageLeft(index) {
      if (index <= 0) {
        return
      }
      this.applyImageList(moveImage(this.imageList, index, index - 1))
    },
    moveImageRight(index) {
      if (index >= this.imageList.length - 1) {
        return
      }
      this.applyImageList(moveImage(this.imageList, index, index + 1))
    },
    removeImage(index) {
      const removedImage = this.imageList[index]
      this.form.images = this.imageList.filter((item, currentIndex) => currentIndex !== index)
      this.forgetAiUploadToken(removedImage)
      this.resetAiValuationModule()
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
    forgetAiUploadToken(filePath) {
      if (!filePath || !this.aiUploadTokenMap[filePath]) {
        return
      }
      const nextTokenMap = { ...this.aiUploadTokenMap }
      delete nextTokenMap[filePath]
      this.aiUploadTokenMap = nextTokenMap
    },
    rememberAiUploadToken(filePath, payload = {}) {
      if (!filePath || !payload.uploadToken) {
        return
      }
      this.aiUploadTokenMap = {
        ...this.aiUploadTokenMap,
        [filePath]: {
          uploadToken: payload.uploadToken,
          expiresAt: Number(payload.expiresAt) || 0
        }
      }
    },
    isAiUploadTokenExpired(filePath) {
      const cached = filePath ? this.aiUploadTokenMap[filePath] : null
      if (!cached || !cached.uploadToken) {
        return true
      }
      const expiresAt = Number(cached.expiresAt) || 0
      return !expiresAt || expiresAt <= Date.now() + 5000
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
      this.aiUploadTokenMap = {}
      this.saveDraft()
      return result
    },
    async prepareAiImages(options = {}) {
      const { forceRefresh = false } = options || {}
      const uploadTokens = []
      const existingImageUrls = []
      const aiImages = this.imageList.filter(Boolean).slice(0, MAX_AI_IMAGE_COUNT)

      for (let index = 0; index < aiImages.length; index += 1) {
        const imagePath = aiImages[index]
        if (this.isUploadedImage(imagePath)) {
          existingImageUrls.push(imagePath)
          continue
        }

        if (!forceRefresh && !this.isAiUploadTokenExpired(imagePath)) {
          uploadTokens.push(this.aiUploadTokenMap[imagePath].uploadToken)
          continue
        }

        uni.showLoading({
          title: `准备 AI 图片 ${index + 1}/${aiImages.length}`,
          mask: true
        })

        const res = await uploadAiValuationImage(imagePath)
        if (!res || res.code !== 0 || !res.data || !res.data.uploadToken) {
          throw new Error((res && res.message) || 'AI 图片上传失败')
        }

        this.rememberAiUploadToken(imagePath, res.data)
        uploadTokens.push(res.data.uploadToken)
      }

      return {
        uploadTokens,
        existingImageUrls
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
        conditionLevel: clampConditionLevel(this.form.conditionLevel),
        price: this.normalizeOptionalNumber(this.form.price) ?? 0,
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
    validatePublishForm() {
      if (!this.form.title || !this.form.price || !this.form.description) {
        return '璇疯ˉ鍏ㄦ爣棰樸€佷环鏍煎拰鎻忚堪'
      }

      const price = Number(this.form.price)
      if (!price || Number.isNaN(price) || price <= 0) {
        return '璇疯緭鍏ユ纭殑鍑哄敭浠锋牸'
      }

      const originalPrice = this.normalizeOptionalNumber(this.form.originalPrice)
      if (originalPrice !== null && (Number.isNaN(originalPrice) || originalPrice < 0)) {
        return '璇疯緭鍏ユ纭殑鍘熶环'
      }

      return ''
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
    resetPageState() {
      this.id = ''
      this.mode = MODE_CREATE
      this.form = createDefaultForm()
      this.categoryTouched = false
      this.showImageInsertPicker = false
      this.pendingInsertImages = []
      this.aiUploadTokenMap = {}
      this.detailLoaded = false
      this.editCapability = null
      this.editWillAutoCancelPendingOrder = false
      this.resetAiValuationModule()
      this.resetDirtyTracking()
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

      if (!this.isPublishedEditMode && !this.hasCampusBound) {
        uni.showModal({
          title: '请先绑定校区',
          content: '正式发布商品前需要先在个人页绑定账号校区，确认后将跳转到个人页。',
          confirmText: '去个人页',
          cancelText: '先留在这里',
          success: ({ confirm }) => {
            if (confirm) {
              this.goToProfileForCampusBinding()
            }
          }
        })
        return
      }

      const validationMessage = this.validatePublishForm()
      if (validationMessage) {
        uni.showToast({ title: validationMessage, icon: 'none' })
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
          res = await publishGoodsDraft(this.id)
        } else {
          res = await updateGoods(this.id, this.buildPublishPayload(images))
        }

        if (res && res.code === 0 && res.data) {
          const targetId = res.data.id || this.id
          const wasEditMode = this.isPublishedEditMode
          this.goodsStore.setLastViewedId(targetId)
          this.resetPageState()
          uni.showToast({ title: res.message || (wasEditMode ? '修改成功' : '发布成功'), icon: 'success' })
          setTimeout(() => {
            const query = wasEditMode ? `id=${targetId}` : `id=${targetId}&fromPublish=1`
            uni.redirectTo({ url: `/pages/goods/detail?${query}` })
          }, 260)
          return
        }
        throw new Error((res && res.message) || '提交失败')
      } catch (error) {
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
      if (this.closeTransientPanels()) {
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
  display: block;
  transition: transform 320ms ease;
}

.image-item:active .image-preview {
  transform: scale(1.04);
}

.image-order-chip {
  position: absolute;
  left: 12rpx;
  top: 12rpx;
  z-index: 2;
  min-width: 60rpx;
  height: 42rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.88);
  color: var(--publish-accent-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 18rpx rgba(45, 39, 31, 0.12);
}

.image-order-chip.active {
  background: rgba(39, 35, 30, 0.82);
  color: #ffffff;
}

.image-actions {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 52rpx 10rpx 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
  background: linear-gradient(180deg, rgba(16, 12, 8, 0) 0%, rgba(16, 12, 8, 0.72) 100%);
}

.image-sort-btn {
  flex: 1;
  min-width: 0;
  height: 44rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 600;
  backdrop-filter: blur(8rpx);
}

.image-sort-btn.active {
  background: rgba(239, 230, 212, 0.95);
  color: var(--publish-accent-strong);
}

.image-sort-btn.disabled {
  opacity: 0.42;
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

.picker-subtitle {
  margin: -8rpx 0 22rpx;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.7;
  color: var(--publish-muted);
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

  .image-item,
  .image-uploader,
  .select-field,
  .price-shell,
  .picker-item {
    transition: none !important;
  }
}
</style>
