<template>
  <view class="app-page publish-page" :class="themeClass">
    <view class="publish-top">
      <view>
        <view class="publish-kicker">Handwritten Draft</view>
        <view class="publish-title">闲置落墨</view>
      </view>
      <view class="draft-tip">自动草稿</view>
    </view>

    <view class="publish-card app-card">
      <view class="field-head">
        <view class="field-title">标题</view>
        <view class="field-note">一句话说清楚你要卖什么</view>
      </view>
      <input
        v-model="form.title"
        class="app-input"
        placeholder="例如：九成新机械键盘，宿舍静音轴"
        @input="saveDraft"
      />

      <view class="field-head spaced">
        <view class="field-title">描述</view>
        <view class="field-note">可以写成色、购买时间、配件和面交地点</view>
      </view>
      <textarea
        v-model="form.description"
        class="app-textarea"
        placeholder="把商品故事写得更具体一点，会更容易成交。"
        @input="saveDraft"
      />

      <view class="poster-preview">
        <view class="poster-stamp">示意图</view>
        <view class="poster-title">{{ form.title || '你的商品标题会出现在这里' }}</view>
        <view class="poster-desc">{{ form.description || '描述内容会在这里生成预览，方便你检查文案节奏。' }}</view>
      </view>
    </view>

    <view class="publish-card app-card">
      <view class="field-row">
        <view class="row-label">价格</view>
        <view class="price-shell">
          <text class="price-symbol">¥</text>
          <input
            v-model="form.price"
            type="digit"
            class="price-input"
            placeholder="0.00"
            @input="saveDraft"
          />
        </view>
      </view>
      <view class="field-row">
        <view class="row-label">交付方式</view>
        <view class="row-value">同校面交 / 宿舍楼下自提</view>
      </view>
      <view class="field-row borderless">
        <view class="row-label">当前状态</view>
        <view class="row-value">接口未开放，提交时保存为本地草稿</view>
      </view>
    </view>

    <view class="bottom-tools">
      <button class="app-secondary-btn bottom-btn" @click="restoreDraft">恢复草稿</button>
      <button class="app-primary-btn bottom-btn" @click="submit">保存并提交</button>
    </view>
  </view>
</template>

<script>
import { useAuthStore } from '../../store/auth'
import { syncThemePage } from '../../utils/theme'

const DRAFT_KEY = 'goods_publish_draft'

function createDefaultForm() {
  return {
    title: '',
    price: '',
    description: ''
  }
}

export default {
  data() {
    return {
      theme: 'light',
      themeClass: '',
      authStore: useAuthStore(),
      form: createDefaultForm()
    }
  },
  onLoad() {
    syncThemePage(this)
    this.restoreDraft()
  },
  onShow() {
    syncThemePage(this)
  },
  methods: {
    saveDraft() {
      uni.setStorageSync(DRAFT_KEY, this.form)
    },
    restoreDraft() {
      const draft = uni.getStorageSync(DRAFT_KEY)
      this.form = draft && typeof draft === 'object' ? { ...createDefaultForm(), ...draft } : createDefaultForm()
    },
    submit() {
      if (!this.authStore.sync().isLoggedIn()) {
        uni.showToast({ title: '请先登录后再发布', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user/login' })
        }, 300)
        return
      }

      if (!this.form.title || !this.form.price || !this.form.description) {
        uni.showToast({ title: '请补全标题、价格和描述', icon: 'none' })
        return
      }

      this.saveDraft()
      uni.showToast({ title: '已保存草稿，待后端发布接口接入', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.publish-page {
  padding-bottom: 40rpx;
}

.publish-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.publish-kicker {
  font-size: 20rpx;
  letter-spacing: 5rpx;
  text-transform: uppercase;
  color: var(--ink-subtext);
  margin-bottom: 8rpx;
}

.publish-title {
  font-family: var(--ink-font-title);
  font-size: 54rpx;
  color: var(--ink-text);
}

.draft-tip {
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-text);
  font-size: 23rpx;
}

.publish-card {
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.field-head {
  margin-bottom: 16rpx;
}

.field-head.spaced {
  margin-top: 26rpx;
}

.field-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--ink-text);
  margin-bottom: 8rpx;
}

.field-note {
  font-size: 22rpx;
  color: var(--ink-subtext);
}

.poster-preview {
  margin-top: 26rpx;
  min-height: 280rpx;
  border-radius: 24rpx;
  padding: 26rpx;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 22%, rgba(0, 0, 0, 0.06) 0, transparent 22%),
    radial-gradient(circle at 78% 34%, rgba(0, 0, 0, 0.05) 0, transparent 24%),
    linear-gradient(155deg, var(--ink-surface-strong) 0%, var(--ink-surface-alt) 100%);
}

.theme-dark .poster-preview {
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.08) 0, transparent 22%),
    radial-gradient(circle at 78% 34%, rgba(255, 255, 255, 0.05) 0, transparent 24%),
    linear-gradient(155deg, var(--ink-surface-strong) 0%, var(--ink-surface-alt) 100%);
}

.poster-stamp {
  width: 100rpx;
  height: 54rpx;
  border-radius: 999rpx;
  background: rgba(250, 226, 120, 0.95);
  color: #2e2618;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  margin-bottom: 22rpx;
}

.poster-title {
  font-family: var(--ink-font-title);
  font-size: 40rpx;
  line-height: 1.4;
  color: var(--ink-text);
  margin-bottom: 18rpx;
}

.poster-desc {
  font-size: 24rpx;
  line-height: 1.9;
  color: var(--ink-subtext);
}

.field-row {
  min-height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  border-bottom: 1rpx solid var(--ink-border);
}

.field-row.borderless {
  border-bottom: none;
}

.row-label {
  width: 160rpx;
  font-size: 28rpx;
  color: var(--ink-text);
}

.row-value {
  flex: 1;
  text-align: right;
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--ink-subtext);
}

.price-shell {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.price-symbol {
  font-size: 34rpx;
  color: var(--ink-price);
  margin-right: 12rpx;
}

.price-input {
  min-width: 220rpx;
  text-align: right;
  font-size: 36rpx;
  color: var(--ink-text);
}

.bottom-tools {
  display: flex;
  gap: 16rpx;
}

.bottom-btn {
  flex: 1;
}
</style>
