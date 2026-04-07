<template>
  <view class="goods-ai-valuation">
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
            价格会受图片清晰度影响，请在发布前再手动确认一次。
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
</template>

<script>
import { adoptAiValuation, createAiValuation } from '../api/goods'

function clampConditionLevel(value) {
  const numeric = Number(value)
  if (!numeric || Number.isNaN(numeric)) {
    return 9
  }
  return Math.max(1, Math.min(10, Math.round(numeric)))
}

function normalizePositiveNumber(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null
  }
  return numeric
}

function isAiUploadExpiredMessage(message) {
  const text = `${message || ''}`.trim()
  return text.includes('临时图片') && (text.includes('过期') || text.includes('重新上传'))
}

export default {
  emits: ['apply-suggestion'],
  props: {
    images: {
      type: Array,
      default: () => []
    },
    titleHint: {
      type: String,
      default: ''
    },
    descriptionHint: {
      type: String,
      default: ''
    },
    categoryIdHint: {
      type: [Number, String],
      default: null
    },
    categoryTouched: {
      type: Boolean,
      default: false
    },
    prepareAiImages: {
      type: Function,
      default: null
    },
    ensureLoggedIn: {
      type: Function,
      default: null
    },
    resetVersion: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      aiValuation: null,
      aiPanelVisible: false,
      aiErrorMessage: '',
      aiLoading: false,
      applyingSuggestion: false,
      valuationRunId: 0,
      applyRunId: 0
    }
  },
  computed: {
    imageList() {
      return Array.isArray(this.images) ? this.images.filter(Boolean) : []
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
  watch: {
    resetVersion(nextValue, previousValue) {
      if (nextValue === previousValue) {
        return
      }
      this.resetState()
    }
  },
  beforeUnmount() {
    this.invalidatePending()
  },
  beforeDestroy() {
    this.invalidatePending()
  },
  methods: {
    formatMoney(value) {
      const amount = Number(value)
      if (Number.isNaN(amount)) {
        return '0.00'
      }
      return amount.toFixed(2)
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
    invalidatePending() {
      this.valuationRunId += 1
      this.applyRunId += 1
    },
    resetState() {
      this.invalidatePending()
      this.aiValuation = null
      this.aiPanelVisible = false
      this.aiErrorMessage = ''
      this.aiLoading = false
      this.applyingSuggestion = false
      uni.hideLoading()
    },
    async ensureCanUseAi() {
      if (typeof this.ensureLoggedIn !== 'function') {
        return true
      }
      try {
        const result = await this.ensureLoggedIn()
        return result !== false
      } catch (error) {
        return false
      }
    },
    async handleAiEntry() {
      if (this.aiLoading) {
        return
      }
      if (!this.imageList.length) {
        uni.showToast({ title: '请先上传商品图片', icon: 'none' })
        return
      }
      if (!this.aiValuation) {
        await this.runAiValuation()
        return
      }
      this.aiPanelVisible = !this.aiPanelVisible
    },
    async runAiValuation() {
      if (this.aiLoading) {
        return
      }
      if (!(await this.ensureCanUseAi())) {
        return
      }
      if (!this.imageList.length) {
        uni.showToast({ title: '请先上传商品图片', icon: 'none' })
        return
      }

      const runId = this.valuationRunId + 1
      this.valuationRunId = runId
      this.aiPanelVisible = true
      this.aiErrorMessage = ''
      this.aiLoading = true

      try {
        const images = typeof this.prepareAiImages === 'function'
          ? await this.prepareAiImages()
          : {
              uploadTokens: [],
              existingImageUrls: this.imageList.filter((item) => /^https?:\/\//.test(`${item || ''}`)).slice(0, 3)
            }

        if (runId !== this.valuationRunId) {
          return
        }

        uni.showLoading({ title: 'AI 识别中', mask: true })
        let res = await createAiValuation({
          uploadTokens: Array.isArray(images && images.uploadTokens) ? images.uploadTokens.slice(0, 3) : [],
          existingImageUrls: Array.isArray(images && images.existingImageUrls) ? images.existingImageUrls.slice(0, 3) : [],
          titleHint: (this.titleHint || '').trim(),
          descriptionHint: (this.descriptionHint || '').trim(),
          categoryIdHint: normalizePositiveNumber(this.categoryIdHint)
        })

        if ((!res || res.code !== 0) && isAiUploadExpiredMessage(res && res.message) && typeof this.prepareAiImages === 'function') {
          const refreshedImages = await this.prepareAiImages({ forceRefresh: true })
          if (runId !== this.valuationRunId) {
            return
          }
          res = await createAiValuation({
            uploadTokens: Array.isArray(refreshedImages && refreshedImages.uploadTokens) ? refreshedImages.uploadTokens.slice(0, 3) : [],
            existingImageUrls: Array.isArray(refreshedImages && refreshedImages.existingImageUrls) ? refreshedImages.existingImageUrls.slice(0, 3) : [],
            titleHint: (this.titleHint || '').trim(),
            descriptionHint: (this.descriptionHint || '').trim(),
            categoryIdHint: normalizePositiveNumber(this.categoryIdHint)
          })
        }

        if (runId !== this.valuationRunId) {
          return
        }

        if (res && res.code === 0 && res.data) {
          this.aiValuation = res.data
          this.aiErrorMessage = ''
          uni.hideLoading()
          uni.showToast({ title: res.message || '识别成功', icon: 'success' })
          return
        }

        throw new Error((res && res.message) || 'AI 识别失败')
      } catch (error) {
        if (runId !== this.valuationRunId) {
          return
        }
        this.aiErrorMessage = error && error.message ? error.message : 'AI 识别失败'
        uni.hideLoading()
        uni.showToast({ title: this.aiErrorMessage, icon: 'none' })
      } finally {
        if (runId !== this.valuationRunId) {
          return
        }
        uni.hideLoading()
        this.aiLoading = false
      }
    },
    async applyAiSuggestion() {
      if (!this.aiValuation || !this.aiValuation.fillSuggestion || this.applyingSuggestion) {
        return
      }
      if (!(await this.ensureCanUseAi())) {
        return
      }

      const runId = this.applyRunId + 1
      const fillSuggestion = this.aiValuation.fillSuggestion
      this.applyRunId = runId
      this.applyingSuggestion = true
      uni.showLoading({ title: '应用建议中', mask: true })

      try {
        if (this.aiValuation.valuationId) {
          const adoptRes = await adoptAiValuation(this.aiValuation.valuationId)
          if (runId !== this.applyRunId) {
            return
          }
          if (adoptRes && adoptRes.code !== 0) {
            throw new Error(adoptRes.message || '应用建议失败')
          }
        }

        const patch = {}

        if (fillSuggestion.title) {
          patch.title = fillSuggestion.title
        }
        if (fillSuggestion.price || fillSuggestion.price === 0) {
          patch.price = this.formatMoney(fillSuggestion.price)
        }
        if (fillSuggestion.conditionLevel) {
          patch.conditionLevel = clampConditionLevel(fillSuggestion.conditionLevel)
        }
        if (fillSuggestion.descriptionAppend) {
          patch.description = this.mergeDescription(this.descriptionHint, fillSuggestion.descriptionAppend)
        }

        const nextCategoryId = normalizePositiveNumber(fillSuggestion.categoryId)
        if (nextCategoryId) {
          if (!this.categoryTouched || String(this.categoryIdHint) === String(nextCategoryId)) {
            patch.categoryId = nextCategoryId
          } else if (this.aiValuation.categoryNameSuggest) {
            uni.showToast({
              title: `已保留当前分类，可参考 AI 建议：${this.aiValuation.categoryNameSuggest}`,
              icon: 'none'
            })
          }
        }

        if (runId !== this.applyRunId) {
          return
        }

        this.$emit('apply-suggestion', patch)
        this.aiValuation = {
          ...this.aiValuation,
          adopted: true
        }
        uni.hideLoading()
        uni.showToast({ title: '已回填 AI 建议', icon: 'success' })
      } catch (error) {
        if (runId !== this.applyRunId) {
          return
        }
        uni.hideLoading()
        uni.showToast({ title: error && error.message ? error.message : '应用建议失败', icon: 'none' })
      } finally {
        if (runId !== this.applyRunId) {
          return
        }
        uni.hideLoading()
        this.applyingSuggestion = false
      }
    }
  }
}
</script>

<style scoped>
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

@media (prefers-reduced-motion: reduce) {
  .ai-loading-card::after,
  .ai-loading-orb {
    animation: none !important;
  }

  .ai-entry-btn,
  .ai-entry-arrow,
  .ai-reveal,
  .ai-metric,
  .ai-secondary-btn,
  .ai-primary-btn {
    transition: none !important;
  }
}
</style>
