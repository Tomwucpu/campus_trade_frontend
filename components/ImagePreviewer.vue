<template>
  <view v-if="rendered" class="image-previewer" :class="{ active }" @click="requestClose">
    <view class="image-previewer-backdrop"></view>

    <view class="image-previewer-top" @click.stop>
      <view class="image-previewer-count">{{ displayIndex }} / {{ normalizedImages.length }}</view>
      <view class="image-previewer-close" @click="requestClose">X</view>
    </view>

    <view class="image-previewer-body">
      <swiper class="image-previewer-swiper" :current="currentIndex" circular @change="handleSwiperChange">
        <swiper-item v-for="(image, index) in normalizedImages" :key="`${image}-${index}`">
          <view class="image-previewer-slide">
            <image class="image-previewer-image" :src="image" mode="aspectFit"></image>
          </view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script>
const OPEN_DELAY = 16
const CLOSE_DELAY = 280

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    images: {
      type: Array,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      rendered: false,
      active: false,
      currentIndex: 0,
      openTimer: null,
      closeTimer: null
    }
  },
  computed: {
    normalizedImages() {
      return Array.isArray(this.images) ? this.images.filter(Boolean) : []
    },
    displayIndex() {
      if (!this.normalizedImages.length) {
        return 0
      }
      return this.currentIndex + 1
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(nextVisible) {
        if (nextVisible) {
          this.openPreview()
          return
        }
        this.closePreview()
      }
    },
    initialIndex(nextIndex) {
      if (this.visible || this.rendered) {
        this.syncCurrentIndex(nextIndex)
      }
    },
    images() {
      this.syncCurrentIndex(this.currentIndex)
    }
  },
  beforeUnmount() {
    this.clearTimers()
  },
  beforeDestroy() {
    this.clearTimers()
  },
  methods: {
    syncCurrentIndex(index = 0) {
      const total = this.normalizedImages.length
      if (!total) {
        this.currentIndex = 0
        return
      }

      const numeric = Number(index)
      if (Number.isNaN(numeric)) {
        this.currentIndex = 0
        return
      }

      this.currentIndex = Math.max(0, Math.min(total - 1, numeric))
    },
    clearTimers() {
      if (this.openTimer) {
        clearTimeout(this.openTimer)
        this.openTimer = null
      }
      if (this.closeTimer) {
        clearTimeout(this.closeTimer)
        this.closeTimer = null
      }
    },
    openPreview() {
      this.clearTimers()
      this.rendered = true
      this.syncCurrentIndex(this.initialIndex)
      this.$nextTick(() => {
        this.openTimer = setTimeout(() => {
          this.active = true
        }, OPEN_DELAY)
      })
    },
    closePreview() {
      this.clearTimers()
      this.active = false
      if (!this.rendered) {
        return
      }

      this.closeTimer = setTimeout(() => {
        this.rendered = false
      }, CLOSE_DELAY)
    },
    handleSwiperChange(event) {
      this.currentIndex = event.detail.current || 0
      this.$emit('change', this.currentIndex)
    },
    requestClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.image-previewer {
  position: fixed;
  inset: 0;
  z-index: 120;
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease;
}

.image-previewer.active {
  opacity: 1;
  pointer-events: auto;
}

.image-previewer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(6, 12, 20, 0);
  transition: background 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.image-previewer.active .image-previewer-backdrop {
  background: rgba(6, 12, 20, 0.94);
}

.image-previewer-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 2;
  padding: calc(28rpx + env(safe-area-inset-top)) 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0;
  transform: translateY(-18rpx);
  transition:
    opacity 220ms ease,
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.image-previewer.active .image-previewer-top {
  opacity: 1;
  transform: translateY(0);
}

.image-previewer-count,
.image-previewer-close {
  min-height: 64rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14rpx);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

.image-previewer-close {
  min-width: 64rpx;
  font-size: 26rpx;
  font-weight: 700;
}

.image-previewer-body {
  position: absolute;
  inset: 0;
  padding: calc(112rpx + env(safe-area-inset-top)) 0 calc(52rpx + env(safe-area-inset-bottom));
  opacity: 0;
  transform: scale(0.92) translateY(28rpx);
  transform-origin: center;
  transition:
    opacity 220ms ease,
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.image-previewer.active .image-previewer-body {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.image-previewer-swiper {
  width: 100%;
  height: 100%;
}

.image-previewer-slide {
  width: 100%;
  height: 100%;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.image-previewer-image {
  width: 100%;
  height: 100%;
}
</style>
