const THEME_KEY = 'app_theme'

const THEME_META = {
  light: {
    navFrontColor: '#000000',
    navBackgroundColor: '#FFFEF9',
    label: '校园白'
  }
}

export function getTheme() {
  const theme = uni.getStorageSync(THEME_KEY)
  if (theme !== 'light') {
    uni.setStorageSync(THEME_KEY, 'light')
  }
  return 'light'
}

export function getThemeMeta(theme = getTheme()) {
  return THEME_META[theme] || THEME_META.light
}

export function setTheme() {
  const next = 'light'
  uni.setStorageSync(THEME_KEY, next)
  applyNavigationTheme(next)
  return next
}

export function toggleTheme() {
  return setTheme()
}

export function resolveThemeClass() {
  return 'theme-light'
}

export function syncThemePage(target) {
  const theme = getTheme()
  if (target) {
    target.theme = theme
    target.themeClass = resolveThemeClass(theme)
  }
  applyNavigationTheme(theme)
  return theme
}

export function applyNavigationTheme(theme = getTheme()) {
  const meta = getThemeMeta(theme)
  uni.setNavigationBarColor({
    frontColor: meta.navFrontColor,
    backgroundColor: meta.navBackgroundColor
  })
}
