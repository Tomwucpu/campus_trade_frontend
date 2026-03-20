const THEME_KEY = 'app_theme'

const THEME_META = {
  light: {
    navFrontColor: '#000000',
    navBackgroundColor: '#f5f1e8',
    label: '白描'
  },
  dark: {
    navFrontColor: '#ffffff',
    navBackgroundColor: '#111111',
    label: '玄墨'
  }
}

export function getTheme() {
  const theme = uni.getStorageSync(THEME_KEY)
  return theme === 'dark' ? 'dark' : 'light'
}

export function getThemeMeta(theme = getTheme()) {
  return THEME_META[theme] || THEME_META.light
}

export function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  uni.setStorageSync(THEME_KEY, next)
  applyNavigationTheme(next)
  return next
}

export function toggleTheme() {
  return setTheme(getTheme() === 'dark' ? 'light' : 'dark')
}

export function resolveThemeClass(theme = getTheme()) {
  return theme === 'dark' ? 'theme-dark' : 'theme-light'
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
