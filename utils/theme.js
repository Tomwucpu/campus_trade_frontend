const THEME_KEY = 'app_theme'

export function getTheme() {
  const theme = uni.getStorageSync(THEME_KEY)
  return theme === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  uni.setStorageSync(THEME_KEY, next)
  applyNavigationTheme(next)
  return next
}

export function resolveThemeClass(theme) {
  return theme === 'dark' ? 'theme-dark' : 'theme-light'
}

export function applyNavigationTheme(theme) {
  const isDark = theme === 'dark'
  uni.setNavigationBarColor({
    frontColor: isDark ? '#ffffff' : '#000000',
    backgroundColor: isDark ? '#121212' : '#f4f3ee'
  })
}
