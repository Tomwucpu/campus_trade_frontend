const ORDER_STATE_KEY = 'order_page_state'

const defaults = {
  status: 'all',
  currentOrderId: null
}

function readState() {
  const saved = uni.getStorageSync(ORDER_STATE_KEY)
  return saved && typeof saved === 'object' ? { ...defaults, ...saved } : { ...defaults }
}

const orderStore = {
  ...readState(),

  persist() {
    uni.setStorageSync(ORDER_STATE_KEY, {
      status: this.status,
      currentOrderId: this.currentOrderId
    })
  },

  sync() {
    Object.assign(this, readState())
    return this
  },

  setStatus(value) {
    this.status = value || 'all'
    this.persist()
  },

  setCurrentOrderId(value) {
    this.currentOrderId = value || null
    this.persist()
  },

  reset() {
    Object.assign(this, defaults)
    this.persist()
  }
}

export const useOrderStore = () => orderStore
