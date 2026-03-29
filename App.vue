<script>
import { applyNavigationTheme, getTheme } from './utils/theme'

export default {
  onLaunch() {
    applyNavigationTheme(getTheme())
    console.log('校园二手交易平台已启动')
  }
}
</script>

<style>
@import "bootstrap-icons/font/bootstrap-icons.css";

:root {
  --campus-bg: #fffef9;
  --campus-bg-soft: #f8faf7;
  --campus-surface: #ffffff;
  --campus-surface-muted: #f8f9fa;
  --campus-surface-soft: #f0f3f5;
  --campus-text: #2c3e50;
  --campus-text-muted: #6c757d;
  --campus-text-light: #adb5bd;
  --campus-primary: #2d6a4f;
  --campus-primary-strong: #1b5e20;
  --campus-primary-soft: #e8f5e9;
  --campus-orange: #f77f00;
  --campus-orange-soft: #fff3e0;
  --campus-border: #e9ecef;
  --campus-danger: #dc3545;
  --campus-danger-soft: #ffebee;
  --campus-info: #1565c0;
  --campus-info-soft: #e3f2fd;
  --campus-shadow: 0 18rpx 52rpx rgba(25, 53, 79, 0.08);
  --campus-shadow-soft: 0 10rpx 24rpx rgba(25, 53, 79, 0.06);
  --campus-radius-xl: 28rpx;
  --campus-radius-lg: 24rpx;
  --campus-radius-md: 20rpx;
  --campus-radius-sm: 16rpx;
  --campus-page-padding: 24rpx;
}

page {
  font-size: 28rpx;
  color: var(--campus-text);
  background: var(--campus-bg);
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
}

view,
text,
button,
input,
textarea,
scroll-view,
swiper,
swiper-item,
image {
  box-sizing: border-box;
}

button {
  padding: 0;
  margin: 0;
  background: transparent;
  line-height: 1;
}

button::after {
  border: none;
}

.theme-light,
.theme-dark {
  color: var(--campus-text);
}

.market-page {
  min-height: 100vh;
  color: var(--campus-text);
  background:
    radial-gradient(circle at top left, rgba(45, 106, 79, 0.16) 0, transparent 28%),
    radial-gradient(circle at top right, rgba(247, 127, 0, 0.09) 0, transparent 26%),
    linear-gradient(180deg, #f8faf7 0%, var(--campus-bg) 260rpx);
  position: relative;
  overflow-x: hidden;
  padding-bottom: calc(34rpx + env(safe-area-inset-bottom));
}

.market-shell {
  padding: 0 var(--campus-page-padding) 24rpx;
}

.safe-top {
  padding-top: calc(var(--status-bar-height) + 24rpx);
}

.market-card {
  background: var(--campus-surface);
  border: 1rpx solid rgba(233, 236, 239, 0.9);
  border-radius: var(--campus-radius-xl);
  box-shadow: var(--campus-shadow);
}

.market-card.soft {
  background: rgba(255, 255, 255, 0.92);
}

.market-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.market-section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--campus-text);
}

.market-section-subtitle {
  font-size: 24rpx;
  line-height: 1.7;
  color: var(--campus-text-muted);
}

.market-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 60rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: var(--campus-surface-muted);
  color: var(--campus-text-muted);
  font-size: 22rpx;
  border: 1rpx solid transparent;
}

.market-pill.active {
  background: var(--campus-primary);
  color: #ffffff;
}

.market-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44rpx;
  padding: 0 18rpx;
  border-radius: 14rpx;
  background: var(--campus-primary-soft);
  color: var(--campus-primary-strong);
  font-size: 22rpx;
  font-weight: 600;
}

.market-tag.warning {
  background: var(--campus-orange-soft);
  color: #e65100;
}

.market-tag.info {
  background: var(--campus-info-soft);
  color: var(--campus-info);
}

.market-tag.muted {
  background: var(--campus-surface-soft);
  color: var(--campus-text-muted);
}

.market-input,
.market-textarea {
  width: 100%;
  border: 2rpx solid transparent;
  border-radius: var(--campus-radius-md);
  background: var(--campus-surface-muted);
  color: var(--campus-text);
  padding: 22rpx 24rpx;
  font-size: 28rpx;
}

.market-input {
  min-height: 90rpx;
}

.market-textarea {
  min-height: 220rpx;
}

.market-primary-btn,
.market-secondary-btn,
.market-ghost-btn {
  margin: 0;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
  padding: 0 34rpx;
  height: 84rpx;
  line-height: 84rpx;
}

.market-primary-btn {
  background: linear-gradient(135deg, var(--campus-primary) 0%, var(--campus-primary-strong) 100%);
  color: #ffffff;
  box-shadow: 0 16rpx 30rpx rgba(45, 106, 79, 0.18);
}

.market-secondary-btn {
  background: #ffffff;
  color: var(--campus-text);
  border: 1rpx solid var(--campus-border);
}

.market-ghost-btn {
  background: transparent;
  color: var(--campus-text-muted);
  border: 1rpx solid var(--campus-border);
}

.market-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.market-back-btn,
.market-icon-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--campus-text);
  box-shadow: var(--campus-shadow-soft);
}

.market-back-btn.transparent,
.market-icon-btn.transparent {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.market-back-symbol {
  font-size: 34rpx;
  line-height: 1;
}

.market-page-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--campus-text);
}

.market-price {
  color: var(--campus-orange);
  font-weight: 700;
}

.market-divider {
  height: 1rpx;
  background: var(--campus-border);
}

.market-empty {
  padding: 100rpx 32rpx;
  text-align: center;
  color: var(--campus-text-muted);
  font-size: 24rpx;
  line-height: 1.8;
}
</style>
