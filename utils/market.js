const FAVORITE_KEY = 'market_favorite_goods_ids'
const MESSAGE_KEY = 'market_message_items'

const SELLER_NAMES = ['张同学', '李同学', '王同学', '赵同学', '孙同学', '周同学']
const CAMPUS_LOCATIONS = ['北区宿舍楼', '南区宿舍楼', '图书馆南门', '教学楼一层', '操场东门', '食堂门口']

const CATEGORY_META = [
  { id: 'all', value: 'all', name: '全部', shortName: '全部', icon: '📦', key: 'all', keywords: [] },
  { id: 2, value: 2, name: '教材书籍', shortName: '教材', icon: '📚', key: 'books', keywords: ['教材', '图书', '书'] },
  { id: 1, value: 1, name: '数码电子', shortName: '数码', icon: '📱', key: 'electronics', keywords: ['数码', '电子', '耳机', '手机', '电脑', '键盘'] },
  { id: 5, value: 5, name: '运动器材', shortName: '运动', icon: '⚽', key: 'sports', keywords: ['运动', '器材', '球', '滑板', '自行车'] },
  { id: 3, value: 3, name: '生活用品', shortName: '日用', icon: '🎒', key: 'daily', keywords: ['生活', '日用', '台灯', '水杯', '收纳'] },
  { id: 4, value: 4, name: '服饰鞋包', shortName: '服饰', icon: '🧥', key: 'fashion', keywords: ['服饰', '鞋包', '衣服', '包'] },
  { id: 6, value: 6, name: '其他', shortName: '其他', icon: '✨', key: 'other', keywords: ['其他'] }
]

const CATEGORY_IMAGES = {
  books: [
    'https://images.unsplash.com/photo-1717505694161-6fd17c5994bb?w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=800'
  ],
  electronics: [
    'https://images.unsplash.com/photo-1697055656373-720a6a0e9b4c?w=800',
    'https://images.unsplash.com/photo-1714576956012-8ee72df0e0ea?w=800',
    'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800'
  ],
  sports: [
    'https://images.unsplash.com/photo-1763753743569-ed1724044e2f?w=800',
    'https://images.unsplash.com/photo-1686435171260-3bff2e93ec59?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800'
  ],
  daily: [
    'https://images.unsplash.com/photo-1766411503488-f90eef1124bb?w=800',
    'https://images.unsplash.com/photo-1525397053281-a37d8a2ff7ce?w=800',
    'https://images.unsplash.com/photo-1757256137041-0aab889db199?w=800'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1766008122479-0bf425daecce?w=800',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'
  ],
  other: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800'
  ]
}

const FALLBACK_GOODS = [
  { id: 101, title: '高等数学教材（上下册）第七版 考研必备', price: 35, originalPrice: 86, conditionLevel: 9, categoryId: 2, sellerName: '张同学', viewCount: 128, createdAt: '2026-03-20 08:10:00', description: '书本保存完好，适合考研和大一基础课复习。' },
  { id: 102, title: '捷安特自行车 24速山地车 校园代步', price: 380, originalPrice: 1200, conditionLevel: 8, categoryId: 5, sellerName: '李同学', viewCount: 96, createdAt: '2026-03-20 07:30:00', description: '宿舍搬离转卖，车况稳定，校内面交。' },
  { id: 103, title: '宿舍台灯 护眼学习灯 可调光', price: 45, originalPrice: 120, conditionLevel: 9, categoryId: 3, sellerName: '王同学', viewCount: 52, createdAt: '2026-03-20 06:40:00', description: '亮度可调，适合晚自习和宿舍阅读。' },
  { id: 104, title: 'Nike 双肩包 大容量书包 通勤必备', price: 120, originalPrice: 399, conditionLevel: 9, categoryId: 4, sellerName: '赵同学', viewCount: 67, createdAt: '2026-03-19 21:20:00', description: '容量大，拉链顺滑，日常通勤很好用。' },
  { id: 105, title: 'AirPods Pro 二代 降噪耳机 国行', price: 680, originalPrice: 1899, conditionLevel: 9, categoryId: 1, sellerName: '孙同学', viewCount: 143, createdAt: '2026-03-19 19:00:00', description: '带充电盒和保护套，音质稳定。' },
  { id: 106, title: '卡西欧计算器 fx-991CN 工程计算', price: 55, originalPrice: 150, conditionLevel: 10, categoryId: 1, sellerName: '周同学', viewCount: 39, createdAt: '2026-03-19 16:10:00', description: '考试必备，几乎全新。' }
]

const CONDITION_OPTIONS = [
  { value: 10, label: '全新' },
  { value: 9, label: '九成新' },
  { value: 8, label: '八成新' },
  { value: 7, label: '七成新' },
  { value: 6, label: '六成新' }
]

const ORDER_STATUS_META = {
  PENDING_PAYMENT: { text: '待付款', type: 'warning' },
  PAID: { text: '待发货', type: 'info' },
  SHIPPED: { text: '待收货', type: 'info' },
  COMPLETED: { text: '已完成', type: 'success' },
  CANCELLED: { text: '已取消', type: 'default' },
  REFUNDED: { text: '已退款', type: 'default' }
}

const GOODS_STATUS_TEXT = {
  PENDING: '待审核',
  ON_SALE: '在售中',
  OFFLINE: '已下架',
  SOLD: '已售出'
}

const DEFAULT_MESSAGES = [
  { id: 'msg-seed-1', type: 'order', title: '订单已完成', content: '你最近的一笔交易已完成，可以继续浏览新的闲置商品。', time: '5分钟前', isRead: false, createdAt: Date.now() - 5 * 60 * 1000 },
  { id: 'msg-seed-2', type: 'audit', title: '商品审核通过', content: '你发布的商品已经成功上架，可以开始等待买家联系。', time: '1小时前', isRead: false, createdAt: Date.now() - 60 * 60 * 1000 },
  { id: 'msg-seed-3', type: 'system', title: '系统通知', content: '校园二手市集已启用新版前端界面，欢迎继续体验。', time: '昨天', isRead: true, createdAt: Date.now() - 24 * 60 * 60 * 1000 }
]

function readStorage(key, fallback) {
  try {
    const value = uni.getStorageSync(key)
    if (typeof value === 'undefined' || value === null || value === '') {
      return fallback
    }
    return value
  } catch (error) {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (error) {}
}

function uniqueList(list) {
  return list.filter((item, index) => item && list.indexOf(item) === index)
}

function createSeed(item = {}, index = 0) {
  const source = `${item.id || ''}${item.goodsId || ''}${item.title || item.goodsTitle || ''}${index}`
  return source.split('').reduce((total, char) => total + char.charCodeAt(0), 0) || index + 1
}

function parseTimeValue(value) {
  if (!value) {
    return 0
  }

  if (typeof value === 'number') {
    return value
  }

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function pickSeed(seed, list = []) {
  if (!list.length) {
    return ''
  }
  return list[Math.abs(seed) % list.length]
}

function chineseDigit(value) {
  const map = { 10: '十', 9: '九', 8: '八', 7: '七', 6: '六', 5: '五', 4: '四', 3: '三', 2: '二', 1: '一' }
  return map[value] || `${value}`
}

function resolveCategoryMetaByAny(value) {
  if (typeof value === 'object' && value) {
    if (value.categoryLabel) {
      const matchedByLabel = CATEGORY_META.find((item) => item.name === value.categoryLabel)
      if (matchedByLabel) {
        return matchedByLabel
      }
    }
    if (value.categoryName) {
      const matchedByName = CATEGORY_META.find((item) => item.name === value.categoryName)
      if (matchedByName) {
        return matchedByName
      }
    }
    if (value.categoryId || value.id) {
      return CATEGORY_META.find((item) => String(item.value) === String(value.categoryId || value.id)) || CATEGORY_META[0]
    }
  }

  return CATEGORY_META.find((item) => String(item.value) === String(value) || item.key === value || item.name === value) || CATEGORY_META[0]
}

function resolveCategoryMeta(item = {}, seed = 0) {
  const matched = resolveCategoryMetaByAny(item)
  if (matched && matched.value !== 'all') {
    return matched
  }

  const label = `${item.categoryLabel || item.categoryName || ''}`
  const keywordMatched = CATEGORY_META.find((meta) => meta.keywords.some((keyword) => label.includes(keyword)))
  if (keywordMatched) {
    return keywordMatched
  }

  if (item.title) {
    const titleMatched = CATEGORY_META.find((meta) => meta.keywords.some((keyword) => item.title.includes(keyword)))
    if (titleMatched) {
      return titleMatched
    }
  }

  return CATEGORY_META[(seed % (CATEGORY_META.length - 1)) + 1]
}

function resolveImagePool(meta) {
  return CATEGORY_IMAGES[meta.key] || CATEGORY_IMAGES.other
}

function createMessageTime(createdAt) {
  const diff = Date.now() - createdAt
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))}分钟前`
  }
  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))}小时前`
  }
  return `${Math.max(1, Math.floor(diff / day))}天前`
}

export function formatAmount(value, fallback = '0.00') {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return fallback
  }
  return amount.toFixed(2)
}

export function formatRelativeTime(value) {
  const timestamp = parseTimeValue(value)
  if (!timestamp) {
    return '刚刚'
  }

  const diff = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))}分钟前`
  }
  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))}小时前`
  }
  return `${Math.max(1, Math.floor(diff / day))}天前`
}

export function formatDateTime(value) {
  const timestamp = parseTimeValue(value)
  if (!timestamp) {
    return ''
  }

  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

export function resolveConditionLabel(level) {
  const numeric = Number(level)
  if (!numeric) {
    return '成色待沟通'
  }
  if (numeric >= 10) {
    return '全新'
  }
  return `${chineseDigit(numeric)}成新`
}

export function resolveGoodsImage(item = {}, index = 0) {
  if (item.imageUrl) {
    return item.imageUrl
  }
  if (Array.isArray(item.images) && item.images.length) {
    return item.images[0]
  }
  const seed = createSeed(item, index)
  const meta = resolveCategoryMeta(item, seed)
  return pickSeed(seed, resolveImagePool(meta))
}

export function resolveGoodsGallery(item = {}, index = 0) {
  if (Array.isArray(item.images) && item.images.length) {
    return uniqueList(item.images).slice(0, 9)
  }
  const seed = createSeed(item, index)
  const meta = resolveCategoryMeta(item, seed)
  const pool = resolveImagePool(meta)
  return uniqueList([resolveGoodsImage(item, index), ...pool]).slice(0, 3)
}

export function normalizeGoodsItem(item = {}, index = 0) {
  const seed = createSeed(item, index)
  const categoryMeta = resolveCategoryMeta(item, seed)
  const priceValue = Number(item.price || 0)
  const originalPriceValue = Number(item.originalPrice || 0)
  const createdAt = item.createdAt || item.updatedAt || item.publishTime || item.publishedAt || Date.now() - seed * 6000
  const imageUrl = resolveGoodsImage(item, index)

  return {
    ...item,
    id: item.id || index + 1,
    sellerId: item.sellerId || null,
    title: item.title || '未命名商品',
    description: item.description || '卖家暂未补充更多描述，欢迎先收藏或咨询详情。',
    priceValue,
    priceText: formatAmount(priceValue),
    originalPriceValue,
    originalPriceText: originalPriceValue ? formatAmount(originalPriceValue) : '',
    conditionLabel: item.conditionLabel || resolveConditionLabel(item.conditionLevel),
    categoryId: item.categoryId || categoryMeta.value,
    categoryLabel: item.categoryLabel || item.categoryName || categoryMeta.name,
    categoryShortName: categoryMeta.shortName,
    categoryIcon: categoryMeta.icon,
    categoryKey: categoryMeta.key,
    imageUrl,
    gallery: resolveGoodsGallery(item, index),
    sellerName: item.sellerName || pickSeed(seed, SELLER_NAMES),
    campusLocation: item.campusLocation || pickSeed(seed + 1, CAMPUS_LOCATIONS),
    viewCount: Number(item.viewCount || item.glanceCount || 0),
    favoriteCount: Number(item.favoriteCount || 6 + (seed % 30)),
    status: item.status || 'ON_SALE',
    statusText: GOODS_STATUS_TEXT[item.status] || '在售中',
    publishedAtText: formatRelativeTime(createdAt),
    createdAtText: formatDateTime(createdAt),
    createdAtValue: parseTimeValue(createdAt),
    sellerRating: item.sellerRating || (4.6 + (seed % 4) * 0.1).toFixed(1),
    sellerStudentNo: item.sellerStudentNo || `2023****${String((seed % 90) + 10)}`,
    isFavorite: isFavoriteGoods(item.id || index + 1)
  }
}

export function normalizeOrderItem(item = {}, index = 0) {
  const seed = createSeed(item, index)
  const statusMeta = ORDER_STATUS_META[item.status] || { text: item.status || '处理中', type: 'default' }
  const createdAt = item.createdAt || Date.now() - seed * 3000
  const payTime = item.payTime || ''
  const shipTime = item.shipTime || ''
  const finishTime = item.finishTime || ''
  const updatedAt = item.updatedAt || finishTime || shipTime || payTime || createdAt
  const goodsBase = normalizeGoodsItem(
    {
      id: item.goodsId || item.id,
      title: item.goodsTitle,
      price: item.goodsPrice || item.totalAmount,
      sellerName: item.sellerName,
      imageUrl: item.imageUrl
    },
    index
  )

  return {
    ...item,
    id: item.id || index + 1,
    orderNo: item.orderNo || `ORD${Date.now()}${index}`,
    goodsId: item.goodsId || goodsBase.id,
    goodsTitle: item.goodsTitle || goodsBase.title,
    imageUrl: goodsBase.imageUrl,
    goodsPriceValue: Number(item.goodsPrice || item.totalAmount || 0),
    goodsPriceText: formatAmount(item.goodsPrice || item.totalAmount || 0),
    quantity: Number(item.quantity || 1),
    totalAmountValue: Number(item.totalAmount || 0),
    totalAmountText: formatAmount(item.totalAmount || 0),
    sellerName: item.sellerName || goodsBase.sellerName,
    buyerName: item.buyerName || pickSeed(seed + 2, SELLER_NAMES),
    counterpartName: item.counterpartName || (item.roleType === 'SELLER' ? item.buyerName : item.sellerName) || pickSeed(seed + 3, SELLER_NAMES),
    statusText: statusMeta.text,
    statusType: statusMeta.type,
    createdAtText: formatDateTime(createdAt),
    createdAtRelative: formatRelativeTime(createdAt),
    createdAtValue: parseTimeValue(createdAt),
    payTimeText: formatDateTime(payTime),
    payTimeValue: parseTimeValue(payTime),
    shipTimeText: formatDateTime(shipTime),
    shipTimeValue: parseTimeValue(shipTime),
    finishTimeText: formatDateTime(finishTime),
    finishTimeValue: parseTimeValue(finishTime),
    updatedAtText: formatDateTime(updatedAt),
    updatedAtValue: parseTimeValue(updatedAt),
    cancelReason: item.cancelReason || '',
    roleType: item.roleType || 'BUYER',
    meetupLocation: pickSeed(seed + 1, CAMPUS_LOCATIONS),
    meetupPhone: `13${(seed % 9) + 1}****${String((seed % 90) + 10).padStart(2, '0')}`
  }
}

export function sortGoodsList(list = [], sortMode = 'latest') {
  const items = list.slice()
  if (sortMode === 'price-low') {
    return items.sort((a, b) => Number(a.priceValue || a.price || 0) - Number(b.priceValue || b.price || 0))
  }
  if (sortMode === 'price-high') {
    return items.sort((a, b) => Number(b.priceValue || b.price || 0) - Number(a.priceValue || a.price || 0))
  }
  if (sortMode === 'hot') {
    return items.sort((a, b) => Number(b.viewCount || 0) - Number(a.viewCount || 0))
  }
  return items.sort((a, b) => Number(b.createdAtValue || 0) - Number(a.createdAtValue || 0))
}

export function filterGoodsList(list = [], filters = {}) {
  const keyword = `${filters.keyword || ''}`.trim().toLowerCase()
  const categoryId = filters.categoryId || 'all'
  const minPrice = Number(filters.minPrice)
  const maxPrice = Number(filters.maxPrice)
  const conditions = Array.isArray(filters.conditions) ? filters.conditions : []

  const filtered = list.filter((rawItem) => {
    const item = rawItem.priceValue ? rawItem : normalizeGoodsItem(rawItem)

    if (keyword) {
      const haystack = `${item.title} ${item.description} ${item.categoryLabel} ${item.sellerName}`.toLowerCase()
      if (!haystack.includes(keyword)) {
        return false
      }
    }

    if (categoryId !== 'all' && String(item.categoryId) !== String(categoryId)) {
      return false
    }

    if (conditions.length && !conditions.includes(item.conditionLabel)) {
      return false
    }

    if (!Number.isNaN(minPrice) && minPrice > 0 && Number(item.priceValue) < minPrice) {
      return false
    }

    if (!Number.isNaN(maxPrice) && maxPrice > 0 && Number(item.priceValue) > maxPrice) {
      return false
    }

    return true
  })

  return sortGoodsList(filtered, filters.sortMode || 'latest')
}

export function getHomeCategories() {
  return CATEGORY_META.slice()
}

export function getDefaultCategoryList() {
  return CATEGORY_META.filter((item) => item.value !== 'all').map((item) => ({
    id: item.value,
    name: item.name,
    shortName: item.shortName,
    icon: item.icon
  }))
}

export function getConditionOptions() {
  return CONDITION_OPTIONS.slice()
}

export function getFallbackGoodsList() {
  return FALLBACK_GOODS.map((item, index) => normalizeGoodsItem(item, index))
}

export function getOrderStatusText(status) {
  return (ORDER_STATUS_META[status] && ORDER_STATUS_META[status].text) || status || '处理中'
}

export function getOrderStatusType(status) {
  return (ORDER_STATUS_META[status] && ORDER_STATUS_META[status].type) || 'default'
}

export function buildOrderTimeline(order = {}) {
  const status = order.status || 'PENDING_PAYMENT'
  const created = order.createdAtValue || parseTimeValue(order.createdAt || Date.now())
  const payTime = order.payTimeValue || parseTimeValue(order.payTime)
  const shipTime = order.shipTimeValue || parseTimeValue(order.shipTime)
  const finishTime = order.finishTimeValue || parseTimeValue(order.finishTime)
  const updatedAt = order.updatedAtValue || parseTimeValue(order.updatedAt)
  const orderNo = order.orderNo || ''

  if (status === 'CANCELLED') {
    return [
      { text: '订单创建成功', time: formatDateTime(created), done: true },
      { text: '订单已取消', time: formatDateTime(updatedAt || created), done: true },
      { text: '交易流程结束', time: '', done: false }
    ]
  }

  return [
    { text: '订单创建成功', time: formatDateTime(created), done: true },
    { text: '买家完成付款', time: formatDateTime(payTime), done: ['PAID', 'SHIPPED', 'COMPLETED', 'REFUNDED'].includes(status) },
    { text: '卖家准备发货', time: formatDateTime(shipTime), done: ['SHIPPED', 'COMPLETED'].includes(status) },
    { text: status === 'COMPLETED' ? '交易已完成' : `等待订单 ${orderNo ? `#${orderNo.slice(-4)}` : ''} 收货`, time: formatDateTime(finishTime), done: status === 'COMPLETED' }
  ]
}

export function getFavoriteGoodsIds() {
  const value = readStorage(FAVORITE_KEY, [])
  return Array.isArray(value) ? value : []
}

export function setFavoriteGoodsIds(ids = []) {
  writeStorage(FAVORITE_KEY, uniqueList(ids.map((item) => String(item))))
}

export function isFavoriteGoods(id) {
  if (!id && id !== 0) {
    return false
  }
  return getFavoriteGoodsIds().includes(String(id))
}

export function toggleFavoriteGoods(id) {
  const targetId = String(id)
  const current = getFavoriteGoodsIds()
  if (current.includes(targetId)) {
    setFavoriteGoodsIds(current.filter((item) => item !== targetId))
    return false
  }
  setFavoriteGoodsIds([...current, targetId])
  return true
}

function ensureMessages() {
  const current = readStorage(MESSAGE_KEY, [])
  if (Array.isArray(current) && current.length) {
    return current
  }
  writeStorage(MESSAGE_KEY, DEFAULT_MESSAGES)
  return DEFAULT_MESSAGES.slice()
}

export function getMessageList() {
  return ensureMessages()
    .slice()
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
    .map((item) => ({
      ...item,
      time: item.time || createMessageTime(item.createdAt || Date.now())
    }))
}

export function pushLocalMessage(payload = {}) {
  const current = ensureMessages()
  const createdAt = Date.now()
  const next = [
    {
      id: `msg-${createdAt}`,
      type: payload.type || 'system',
      title: payload.title || '系统通知',
      content: payload.content || '',
      isRead: false,
      createdAt,
      time: createMessageTime(createdAt)
    },
    ...current
  ]
  writeStorage(MESSAGE_KEY, next.slice(0, 30))
}

export function markAllMessagesRead() {
  const next = ensureMessages().map((item) => ({ ...item, isRead: true }))
  writeStorage(MESSAGE_KEY, next)
}

export function getUnreadMessageCount() {
  return getMessageList().filter((item) => !item.isRead).length
}

export function getMessageMeta(type) {
  if (type === 'order') {
    return { icon: '✓', iconBg: '#E8F5E9', iconColor: '#1B5E20' }
  }
  if (type === 'audit') {
    return { icon: '审', iconBg: '#FFF3E0', iconColor: '#E65100' }
  }
  return { icon: '铃', iconBg: '#E3F2FD', iconColor: '#1565C0' }
}

export function createCampusAddress(order = {}) {
  return `${order.counterpartName || order.sellerName || '同学'} · ${order.meetupPhone || '13****5678'} · ${order.meetupLocation || '图书馆南门'}`
}

export function maskPhone(value) {
  const raw = `${value || ''}`
  if (!raw) {
    return '未填写手机号'
  }
  if (raw.includes('*')) {
    return raw
  }
  return raw.length >= 7 ? `${raw.slice(0, 3)}****${raw.slice(-4)}` : raw
}

export function maskStudentNo(value) {
  const raw = `${value || ''}`
  if (!raw) {
    return '未填写学号'
  }
  if (raw.includes('*')) {
    return raw
  }
  return raw.length >= 6 ? `${raw.slice(0, 3)}****${raw.slice(-2)}` : raw
}
