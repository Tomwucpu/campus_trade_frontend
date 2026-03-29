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
  --campus-bg: #fcfbf7;
  --campus-page-bg:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.92) 0, rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, #edeff1 0%, #f8f7f3 260rpx, var(--campus-bg) 100%);
  --campus-bg-soft: #f5f2eb;
  --campus-surface: #f7f3ed;
  --campus-surface-muted: #f3efe6;
  --campus-surface-soft: #ece7dd;
  --campus-text: #2f2922;
  --campus-text-muted: #8a8174;
  --campus-text-light: #b3ab9f;
  --campus-primary: #27231e;
  --campus-primary-strong: #1f1a15;
  --campus-primary-soft: #ece7dd;
  --campus-orange: #b13d28;
  --campus-orange-soft: #f8ece8;
  --campus-border: #d8d1c4;
  --campus-danger: #ab4338;
  --campus-danger-soft: #f6e4df;
  --campus-info: #8f7c67;
  --campus-info-soft: #f3ede3;
  --campus-shadow: 0 18rpx 36rpx rgba(45, 39, 31, 0.08);
  --campus-shadow-soft: 0 12rpx 24rpx rgba(45, 39, 31, 0.06);
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
  background: var(--campus-page-bg);
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
  background: rgba(247, 243, 237, 0.95);
  border: 1rpx solid rgba(216, 209, 196, 0.9);
  border-radius: var(--campus-radius-xl);
  box-shadow: var(--campus-shadow);
}

.market-card.soft {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(228, 223, 214, 0.85);
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
  font-weight: 600;
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
  background: rgba(243, 239, 230, 0.92);
  color: var(--campus-text-muted);
  font-size: 22rpx;
  border: 1rpx solid rgba(216, 209, 196, 0.82);
}

.market-pill.active {
  background: var(--campus-primary);
  color: #ffffff;
  border-color: var(--campus-primary);
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
  border: 1rpx solid rgba(206, 199, 188, 0.76);
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
  border: 1rpx solid rgba(216, 209, 196, 0.88);
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
  font-size: 26rpx;
  font-weight: 500;
  padding: 0 34rpx;
  height: 82rpx;
  line-height: 82rpx;
}

.market-primary-btn {
  background: var(--campus-primary);
  color: #ffffff;
  border: 1rpx solid var(--campus-primary-strong);
  box-shadow: 0 10rpx 20rpx rgba(39, 35, 30, 0.2);
}

.market-secondary-btn {
  background: rgba(247, 243, 235, 0.9);
  color: #6b6459;
  border: 1rpx solid #ccc4b8;
}

.market-ghost-btn {
  background: transparent;
  color: #8f8679;
  border: 1rpx solid rgba(204, 196, 184, 0.9);
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
  background: rgba(255, 255, 255, 0.86);
  border: 1rpx solid rgba(226, 221, 212, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--campus-text);
  box-shadow: var(--campus-shadow-soft);
}

.market-back-btn.transparent,
.market-icon-btn.transparent {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.market-back-symbol {
  font-size: 34rpx;
  line-height: 1;
}

.market-page-title {
  font-size: 34rpx;
  font-weight: 600;
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
  line-height: 1.7;
}

.icon-font {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-style: normal;
  font-family: "bootstrap-icons";
}
</style>
