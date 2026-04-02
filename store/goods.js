const GOODS_STATE_KEY = 'goods_page_state'

const defaults = {
  keyword: '',
  categoryId: 'all',
  minPrice: '',
  maxPrice: '',
  quickFilter: 'all',
  feedTab: 'recommend',
  lastViewedId: null,
  preferredCampusCode: ''
}

function readState() {
  const saved = uni.getStorageSync(GOODS_STATE_KEY)
  return saved && typeof saved === 'object' ? { ...defaults, ...saved } : { ...defaults }
}

const goodsStore = {
  ...readState(),

  persist() {
    uni.setStorageSync(GOODS_STATE_KEY, {
      keyword: this.keyword,
      categoryId: this.categoryId,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      quickFilter: this.quickFilter,
      feedTab: this.feedTab,
      lastViewedId: this.lastViewedId,
      preferredCampusCode: this.preferredCampusCode
    })
  },

  sync() {
    Object.assign(this, readState())
    return this
  },

  setKeyword(value) {
    this.keyword = (value || '').trim()
    this.persist()
  },

  setCategoryId(value) {
    this.categoryId = value || 'all'
    this.persist()
  },

  setPriceRange(minPrice = '', maxPrice = '') {
    this.minPrice = minPrice === null || typeof minPrice === 'undefined' ? '' : String(minPrice)
    this.maxPrice = maxPrice === null || typeof maxPrice === 'undefined' ? '' : String(maxPrice)
    this.persist()
  },

  setQuickFilter(value) {
    this.quickFilter = value || 'all'
    this.persist()
  },

  setFeedTab(value) {
    this.feedTab = value || 'recommend'
    this.persist()
  },

  setLastViewedId(value) {
    this.lastViewedId = value || null
    this.persist()
  },

  setPreferredCampusCode(value) {
    this.preferredCampusCode = value || ''
    this.persist()
  },

  applyListQuery({ keyword, quickFilter, categoryId, minPrice, maxPrice } = {}) {
    if (typeof keyword !== 'undefined') {
      this.keyword = (keyword || '').trim()
    }
    if (typeof quickFilter !== 'undefined') {
      this.quickFilter = quickFilter || 'all'
    }
    if (typeof categoryId !== 'undefined') {
      this.categoryId = categoryId || 'all'
    }
    if (typeof minPrice !== 'undefined' || typeof maxPrice !== 'undefined') {
      this.minPrice = minPrice || ''
      this.maxPrice = maxPrice || ''
    }
    this.persist()
  },

  resetFilters() {
    Object.assign(this, {
      ...defaults,
      preferredCampusCode: this.preferredCampusCode
    })
    this.persist()
  }
}

export const useGoodsStore = () => goodsStore
