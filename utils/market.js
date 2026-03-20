const SELLER_NAMES = ['松烟', '知白', '临池', '怀墨', '青砚', '一澄']
const CAMPUS_ZONES = ['图书馆南侧', '荷风宿舍区', '知新楼下', '松涛食堂东门', '操场东门', '实验楼前']

const CATEGORY_OPTIONS = [
  { value: 'recommend', label: '推荐' },
  { value: 'digital', label: '数码', keywords: ['数码', '电子'] },
  { value: 'books', label: '教材', keywords: ['教材', '图书'] },
  { value: 'life', label: '生活', keywords: ['生活'] },
  { value: 'fashion', label: '服饰', keywords: ['服饰', '鞋包'] },
  { value: 'sports', label: '运动', keywords: ['运动', '器材'] }
]

const DEFAULT_CATEGORIES = [
  { id: 1, name: '数码电子' },
  { id: 2, name: '教材图书' },
  { id: 3, name: '生活用品' },
  { id: 4, name: '服饰鞋包' },
  { id: 5, name: '运动器材' }
]

const CONDITION_OPTIONS = [9, 8, 7, 6, 5]

const ORDER_STATUS_MAP = {
  PENDING_PAYMENT: { text: '待支付', tone: 'pending' },
  PAID: { text: '待发货', tone: 'active' },
  SHIPPED: { text: '待收货', tone: 'active' },
  COMPLETED: { text: '已完成', tone: 'done' },
  CANCELLED: { text: '已取消', tone: 'muted' }
}

function pickSeed(seed, list) {
  return list[Math.abs(seed) % list.length]
}

function createSeed(item, index = 0) {
  const source = `${item && item.id ? item.id : ''}${item && item.title ? item.title : ''}${index}`
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
    return '刚刚发布'
  }

  const diff = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))} 分钟前`
  }
  if (diff < day) {
    return `${Math.max(1, Math.floor(diff / hour))} 小时前`
  }
  return `${Math.max(1, Math.floor(diff / day))} 天前`
}

export function resolveConditionLabel(level) {
  const numeric = Number(level)
  if (!numeric) {
    return '成色待沟通'
  }
  return `${numeric} 成新`
}

function resolveCategoryLabel(item, seed) {
  if (item.categoryLabel) {
    return item.categoryLabel
  }
  if (item.categoryName) {
    return item.categoryName
  }

  const byId = DEFAULT_CATEGORIES.find((entry) => String(entry.id) === String(item.categoryId))
  if (byId) {
    return byId.name
  }
  return pickSeed(seed + 3, DEFAULT_CATEGORIES).name
}

function resolveGoodsStatusText(status) {
  if (status === 'OFFLINE') {
    return '交易中'
  }
  if (status === 'SOLD') {
    return '已售出'
  }
  return '在售'
}

function resolveStampText(status, seed) {
  if (status === 'SOLD') {
    return '售罄'
  }
  if (status === 'OFFLINE') {
    return '锁单'
  }
  return seed % 2 === 0 ? '速出' : '面交'
}

function uniqueList(values) {
  return values.filter((item, index) => item && values.indexOf(item) === index)
}

export function normalizeGoodsItem(item = {}, index = 0) {
  const seed = createSeed(item, index)
  const categoryLabel = resolveCategoryLabel(item, seed)
  const conditionLabel = item.conditionLabel || resolveConditionLabel(item.conditionLevel)
  const statusText = resolveGoodsStatusText(item.status)
  const sortTime =
    parseTimeValue(item.publishTime) ||
    parseTimeValue(item.publishedAt) ||
    parseTimeValue(item.createTime) ||
    parseTimeValue(item.createdAt) ||
    Number(item.id) ||
    seed

  return {
    ...item,
    id: item.id || index + 1,
    title: item.title || '未命名商品',
    description: item.description || '卖家暂未补充更多描述，建议先沟通成色、配件和交易地点。',
    priceText: formatAmount(item.price, '0.00'),
    sellerName: item.sellerName || `${pickSeed(seed, SELLER_NAMES)}同学`,
    campusArea: item.campusArea || pickSeed(seed + 1, CAMPUS_ZONES),
    conditionLabel,
    categoryLabel,
    sortTime,
    wishCount: Number(item.wishCount || 8 + (seed % 30)),
    glanceCount: Number(item.viewCount ?? item.glanceCount ?? 0),
    publishedAtText: formatRelativeTime(item.createdAt || item.updatedAt || item.publishedAt),
    coverStyle: `tone-${seed % 5}`,
    badges: uniqueList([categoryLabel, conditionLabel, statusText]),
    stampText: resolveStampText(item.status, seed),
    statusText
  }
}

export function normalizeOrderItem(item = {}, index = 0) {
  const seed = createSeed(item, index)
  const status = ORDER_STATUS_MAP[item.status] || { text: item.status || '处理中', tone: 'active' }
  const counterpartName =
    item.counterpartName ||
    (item.roleType === 'SELLER' ? item.buyerName : item.sellerName) ||
    `${pickSeed(seed, SELLER_NAMES)}同学`

  return {
    ...item,
    id: item.id || index + 1,
    orderNo: item.orderNo || `OD20260320${String(index + 1).padStart(4, '0')}`,
    totalAmountText: formatAmount(item.totalAmount, '0.00'),
    statusText: status.text,
    statusTone: status.tone,
    goodsTitle: item.goodsTitle || `校园闲置 ${pickSeed(seed + 1, DEFAULT_CATEGORIES).name}`,
    counterpartName,
    summary: `当前订单状态为“${status.text}”，请与${counterpartName}保持沟通。`
  }
}

export function getCategoryOptions() {
  return CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label }))
}

export function matchesGoodsTab(item, tab) {
  if (tab === 'recommend') {
    return true
  }

  const option = CATEGORY_OPTIONS.find((entry) => entry.value === tab)
  if (!option || !option.keywords) {
    return true
  }

  const label = item.categoryLabel || ''
  return option.keywords.some((keyword) => label.includes(keyword))
}

export function getDefaultCategoryList() {
  return DEFAULT_CATEGORIES.slice()
}

export function getConditionOptions() {
  return CONDITION_OPTIONS.slice()
}
