const SELLER_NAMES = ['松烟', '知白', '临池', '怀石', '青砚', '一墨']
const CAMPUS_ZONES = ['图书馆南侧', '荷风宿舍区', '知新楼下', '松涛食堂旁', '操场东门', '实验楼前']
const CONDITION_LABELS = ['九成新', '轻微使用痕迹', '自用闲置', '可当面验货', '同校优先', '支持小刀']
const CATEGORY_LABELS = ['推荐', '新上', '教材', '数码', '代步', '生活']

function pickSeed(seed, list) {
  return list[Math.abs(seed) % list.length]
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

function formatAmount(value, fallback = '0.00') {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return fallback
  }
  return amount.toFixed(2)
}

function createSeed(item, index = 0) {
  const source = `${item && item.id ? item.id : ''}${item && item.title ? item.title : ''}${index}`
  return source.split('').reduce((total, char) => total + char.charCodeAt(0), 0) || index + 1
}

export function normalizeGoodsItem(item = {}, index = 0) {
  const seed = createSeed(item, index)
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
    title: item.title || '未命名闲置',
    description: item.description || '卖家暂未补充更多描述，建议先沟通成色、配件与面交地点。',
    priceText: formatAmount(item.price, '99.00'),
    sellerName: item.sellerName || `${pickSeed(seed, SELLER_NAMES)}同学`,
    campusArea: item.campusArea || pickSeed(seed + 1, CAMPUS_ZONES),
    conditionLabel: item.conditionLabel || pickSeed(seed + 2, CONDITION_LABELS),
    categoryLabel: item.categoryLabel || pickSeed(seed + 3, CATEGORY_LABELS),
    sortTime,
    wishCount: item.wishCount || 8 + (seed % 37),
    glanceCount: item.glanceCount || 60 + (seed % 180),
    publishedAtText: item.publishedAtText || `${1 + (seed % 6)}小时前发布`,
    coverStyle: `tone-${seed % 5}`,
    badges: [pickSeed(seed + 2, CONDITION_LABELS), '同校流转'],
    stampText: seed % 2 === 0 ? '包邮' : '速出'
  }
}

const ORDER_STATUS_MAP = {
  PENDING_PAYMENT: { text: '待付款', tone: 'pending' },
  PENDING_DELIVERY: { text: '待交付', tone: 'pending' },
  PENDING_RECEIPT: { text: '待收货', tone: 'active' },
  COMPLETED: { text: '已完成', tone: 'done' },
  CANCELLED: { text: '已取消', tone: 'muted' }
}

export function normalizeOrderItem(item = {}, index = 0) {
  const seed = createSeed(item, index)
  const status = ORDER_STATUS_MAP[item.status] || { text: item.status || '处理中', tone: 'active' }

  return {
    ...item,
    id: item.id || index + 1,
    orderNo: item.orderNo || `OD20260320${String(index + 1).padStart(4, '0')}`,
    totalAmountText: formatAmount(item.totalAmount, '0.00'),
    statusText: status.text,
    statusTone: status.tone,
    goodsTitle: item.goodsTitle || `校园闲置 ${pickSeed(seed + 1, CATEGORY_LABELS)}`,
    sellerName: item.sellerName || `${pickSeed(seed, SELLER_NAMES)}同学`,
    summary: item.summary || '建议与卖家确认面交时间、配件完整度和商品细节。'
  }
}

export function getCategoryOptions() {
  return [
    { value: 'all', label: '全部' },
    { value: 'recommend', label: '推荐' },
    { value: 'new', label: '新上' },
    { value: 'books', label: '教材' },
    { value: 'digital', label: '数码' },
    { value: 'life', label: '生活' }
  ]
}
