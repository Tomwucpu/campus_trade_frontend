<script>
import { getTheme, applyNavigationTheme } from './utils/theme'

export default {
  onLaunch() {
    applyNavigationTheme(getTheme())
    console.log('校园二手交易平台启动')
  }
}
</script>

<style>
:root {
  --ink-bg: #f4f3ee;
  --ink-surface: #fbfaf7;
  --ink-surface-alt: #f0efe9;
  --ink-text: #1f1f1b;
  --ink-subtext: #65645f;
  --ink-border: #d9d6cf;
  --ink-accent: #2f2f2a;
  --ink-shadow: 0 8rpx 24rpx rgba(18, 18, 16, 0.1);
  --ink-price: #8b332f;
  --ink-tag-bg: rgba(24, 24, 20, 0.08);
  --ink-tag-active-bg: #22221d;
  --ink-tag-active-text: #f8f8f4;
}

page {
  font-size: 28rpx;
  color: #1f1f1b;
  background: #f4f3ee;
}

.theme-light {
  --ink-bg: #f4f3ee;
  --ink-surface: #fbfaf7;
  --ink-surface-alt: #f0efe9;
  --ink-text: #1f1f1b;
  --ink-subtext: #65645f;
  --ink-border: #d9d6cf;
  --ink-accent: #2f2f2a;
  --ink-shadow: 0 8rpx 24rpx rgba(18, 18, 16, 0.1);
  --ink-price: #8b332f;
  --ink-tag-bg: rgba(24, 24, 20, 0.08);
  --ink-tag-active-bg: #22221d;
  --ink-tag-active-text: #f8f8f4;
}

.theme-dark {
  --ink-bg: #121212;
  --ink-surface: #191919;
  --ink-surface-alt: #202020;
  --ink-text: #efefe9;
  --ink-subtext: #b5b3ad;
  --ink-border: #343434;
  --ink-accent: #ece9dd;
  --ink-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.35);
  --ink-price: #d58f86;
  --ink-tag-bg: rgba(255, 255, 255, 0.12);
  --ink-tag-active-bg: #ece9dd;
  --ink-tag-active-text: #1c1c1c;
}

.app-page {
  min-height: 100vh;
  padding: 26rpx;
  box-sizing: border-box;
  background:
    linear-gradient(160deg, rgba(0, 0, 0, 0.04) 0%, transparent 30%),
    linear-gradient(20deg, rgba(0, 0, 0, 0.03) 0%, transparent 38%),
    var(--ink-bg);
  color: var(--ink-text);
}

.theme-dark.app-page {
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.06) 0%, transparent 32%),
    linear-gradient(20deg, rgba(255, 255, 255, 0.04) 0%, transparent 40%),
    var(--ink-bg);
}

.app-title {
  font-size: 42rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  color: var(--ink-text);
}

.app-subtitle {
  font-size: 24rpx;
  margin-bottom: 22rpx;
  color: var(--ink-subtext);
}

.app-card {
  background: var(--ink-surface);
  border: 1rpx solid var(--ink-border);
  border-radius: 20rpx;
  box-shadow: var(--ink-shadow);
}

.app-input,
.app-textarea {
  width: 100%;
  box-sizing: border-box;
  background: var(--ink-surface-alt);
  color: var(--ink-text);
  border: 1rpx solid var(--ink-border);
  border-radius: 16rpx;
  padding: 18rpx 22rpx;
  transition: all 0.2s ease;
}

.app-input {
  min-height: 84rpx;
}

.app-textarea {
  min-height: 220rpx;
}

.app-input:focus,
.app-textarea:focus {
  border-color: var(--ink-accent);
  background: var(--ink-surface);
  box-shadow: 0 0 0 4rpx rgba(50, 50, 45, 0.12);
}

.app-primary-btn,
.app-secondary-btn {
  border-radius: 16rpx;
  border: 1rpx solid var(--ink-border);
  font-size: 29rpx;
  font-weight: 600;
}

.app-primary-btn {
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
}

.app-primary-btn:active {
  transform: translateY(2rpx);
  opacity: 0.92;
}

.app-secondary-btn {
  background: var(--ink-surface-alt);
  color: var(--ink-text);
}

.app-secondary-btn:active {
  opacity: 0.92;
}

.app-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 26rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  font-size: 23rpx;
}

.app-tag.active {
  background: var(--ink-tag-active-bg);
  color: var(--ink-tag-active-text);
}

.app-empty {
  margin-top: 14rpx;
  text-align: center;
  color: var(--ink-subtext);
  padding: 50rpx 24rpx;
  font-size: 25rpx;
}

.app-price {
  color: var(--ink-price);
  font-weight: 700;
}
</style>

