const ORDER_STATE_KEY = 'order_page_state'

const defaults = {
  status: 'all',
  currentOrderId: null,
  currentOrder: null
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
      currentOrderId: this.currentOrderId,
      currentOrder: this.currentOrder
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
    if (this.currentOrder && String(this.currentOrder.id) !== String(this.currentOrderId)) {
      this.currentOrder = null
    }
    this.persist()
  },

  setCurrentOrder(value) {
    this.currentOrder = value && typeof value === 'object' ? value : null
    this.currentOrderId = this.currentOrder ? this.currentOrder.id : this.currentOrderId
    this.persist()
  },

  reset() {
    Object.assign(this, defaults)
    this.persist()
  }
}

export const useOrderStore = () => orderStore
