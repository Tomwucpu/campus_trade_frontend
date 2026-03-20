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
:root {
  --ink-font-title: "STKaiti", "KaiTi", serif;
  --ink-font-body: "FangSong", "STSong", serif;
  --ink-bg: #f5f1e8;
  --ink-bg-soft: #ece5d8;
  --ink-surface: rgba(252, 249, 241, 0.92);
  --ink-surface-strong: #fdfbf5;
  --ink-surface-alt: #ebe4d7;
  --ink-text: #171512;
  --ink-subtext: #6a655c;
  --ink-border: rgba(33, 30, 24, 0.12);
  --ink-border-strong: rgba(33, 30, 24, 0.28);
  --ink-accent: #171512;
  --ink-accent-soft: rgba(23, 21, 18, 0.08);
  --ink-shadow: 0 24rpx 60rpx rgba(27, 24, 21, 0.08);
  --ink-shadow-soft: 0 14rpx 36rpx rgba(27, 24, 21, 0.05);
  --ink-price: #8f2b22;
  --ink-success: #2d4a3b;
  --ink-tag-bg: rgba(27, 24, 21, 0.06);
  --ink-tag-active-bg: #171512;
  --ink-tag-active-text: #f8f4ea;
  --ink-overlay: rgba(255, 255, 255, 0.4);
}

page {
  font-size: 28rpx;
  color: var(--ink-text);
  background: var(--ink-bg);
  font-family: var(--ink-font-body);
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

button::after {
  border: none;
}

.theme-light {
  --ink-bg: #f5f1e8;
  --ink-bg-soft: #ece5d8;
  --ink-surface: rgba(252, 249, 241, 0.92);
  --ink-surface-strong: #fdfbf5;
  --ink-surface-alt: #ebe4d7;
  --ink-text: #171512;
  --ink-subtext: #6a655c;
  --ink-border: rgba(33, 30, 24, 0.12);
  --ink-border-strong: rgba(33, 30, 24, 0.28);
  --ink-accent: #171512;
  --ink-accent-soft: rgba(23, 21, 18, 0.08);
  --ink-shadow: 0 24rpx 60rpx rgba(27, 24, 21, 0.08);
  --ink-shadow-soft: 0 14rpx 36rpx rgba(27, 24, 21, 0.05);
  --ink-price: #8f2b22;
  --ink-success: #2d4a3b;
  --ink-tag-bg: rgba(27, 24, 21, 0.06);
  --ink-tag-active-bg: #171512;
  --ink-tag-active-text: #f8f4ea;
  --ink-overlay: rgba(255, 255, 255, 0.4);
}

.theme-dark {
  --ink-bg: #101010;
  --ink-bg-soft: #171717;
  --ink-surface: rgba(25, 25, 25, 0.94);
  --ink-surface-strong: #1b1b1b;
  --ink-surface-alt: #222222;
  --ink-text: #f0ece3;
  --ink-subtext: #bcb5a7;
  --ink-border: rgba(255, 248, 233, 0.12);
  --ink-border-strong: rgba(255, 248, 233, 0.28);
  --ink-accent: #f0ece3;
  --ink-accent-soft: rgba(255, 248, 233, 0.08);
  --ink-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.34);
  --ink-shadow-soft: 0 14rpx 36rpx rgba(0, 0, 0, 0.22);
  --ink-price: #f4b3a9;
  --ink-success: #98bca7;
  --ink-tag-bg: rgba(255, 248, 233, 0.08);
  --ink-tag-active-bg: #f0ece3;
  --ink-tag-active-text: #111111;
  --ink-overlay: rgba(0, 0, 0, 0.28);
}

.app-page {
  min-height: 100vh;
  padding: 28rpx;
  color: var(--ink-text);
  background:
    radial-gradient(circle at top left, rgba(90, 82, 72, 0.09) 0, transparent 26%),
    radial-gradient(circle at top right, rgba(90, 82, 72, 0.06) 0, transparent 22%),
    linear-gradient(180deg, var(--ink-bg-soft) 0%, var(--ink-bg) 240rpx);
  position: relative;
  overflow-x: hidden;
}

.theme-dark.app-page {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.08) 0, transparent 20%),
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.05) 0, transparent 18%),
    linear-gradient(180deg, #171717 0%, var(--ink-bg) 240rpx);
}

.app-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(115deg, transparent 0%, var(--ink-overlay) 36%, transparent 70%),
    linear-gradient(12deg, rgba(0, 0, 0, 0.02) 0%, transparent 30%),
    linear-gradient(190deg, rgba(0, 0, 0, 0.03) 0%, transparent 40%);
  opacity: 0.8;
}

.theme-dark.app-page::before {
  background:
    linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.05) 36%, transparent 70%),
    linear-gradient(12deg, rgba(255, 255, 255, 0.04) 0%, transparent 30%),
    linear-gradient(190deg, rgba(255, 255, 255, 0.03) 0%, transparent 40%);
}

.app-card {
  position: relative;
  background: var(--ink-surface);
  border: 1rpx solid var(--ink-border);
  border-radius: 28rpx;
  box-shadow: var(--ink-shadow);
  backdrop-filter: blur(10rpx);
}

.app-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0, transparent 28%),
    linear-gradient(315deg, rgba(255, 255, 255, 0.04) 0, transparent 32%);
}

.theme-dark .app-card::after {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0, transparent 28%),
    linear-gradient(315deg, rgba(255, 255, 255, 0.03) 0, transparent 32%);
}

.app-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.app-title {
  font-family: var(--ink-font-title);
  font-size: 42rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: var(--ink-text);
}

.app-subtitle {
  font-size: 24rpx;
  color: var(--ink-subtext);
  line-height: 1.7;
}

.app-input,
.app-textarea {
  width: 100%;
  border: 1rpx solid var(--ink-border);
  border-radius: 22rpx;
  background: var(--ink-surface-strong);
  color: var(--ink-text);
  padding: 18rpx 22rpx;
  font-size: 28rpx;
}

.app-input {
  min-height: 88rpx;
}

.app-textarea {
  min-height: 220rpx;
}

.app-primary-btn,
.app-secondary-btn,
.app-ghost-btn {
  margin: 0;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
  padding: 0 32rpx;
  height: 82rpx;
  line-height: 82rpx;
}

.app-primary-btn {
  background: var(--ink-accent);
  color: var(--ink-tag-active-text);
  border: 1rpx solid var(--ink-accent);
}

.app-secondary-btn {
  background: var(--ink-surface-alt);
  color: var(--ink-text);
  border: 1rpx solid var(--ink-border);
}

.app-ghost-btn {
  background: transparent;
  color: var(--ink-text);
  border: 1rpx solid var(--ink-border-strong);
}

.app-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 22rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: var(--ink-tag-bg);
  color: var(--ink-subtext);
  font-size: 23rpx;
  border: 1rpx solid transparent;
}

.app-chip.active {
  background: var(--ink-tag-active-bg);
  color: var(--ink-tag-active-text);
  border-color: var(--ink-tag-active-bg);
}

.app-chip.outline {
  background: transparent;
  border-color: var(--ink-border);
}

.app-price {
  color: var(--ink-price);
  font-weight: 700;
}

.app-empty {
  padding: 80rpx 32rpx;
  text-align: center;
  color: var(--ink-subtext);
  font-size: 25rpx;
  line-height: 1.8;
}

.app-divider {
  height: 1rpx;
  background: var(--ink-border);
}
</style>
