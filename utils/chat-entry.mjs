function hasTargetValue(value) {
  return !(value === '' || value === null || typeof value === 'undefined')
}

async function defaultOpenConversation(target) {
  const { openConversation } = await import('../api/chat.js')
  return openConversation(target)
}

function getMissingTargetMessage(target = {}) {
  if (target && target.missingTargetMessage) {
    return target.missingTargetMessage
  }
  if (target && Object.prototype.hasOwnProperty.call(target, 'orderId')) {
    return '订单信息加载中'
  }
  if (target && Object.prototype.hasOwnProperty.call(target, 'goodsId')) {
    return '商品信息加载中'
  }
  return '会话信息加载中'
}

export function buildChatDetailUrl(conversationId) {
  return `/pages/chat/detail?id=${encodeURIComponent(String(conversationId))}`
}

export async function openConversationAndNavigate(target = {}, options = {}) {
  const {
    openConversation: openConversationRequest = defaultOpenConversation,
    navigateTo = (url) => {
      uni.navigateTo({ url })
    },
    showToast = (title) => {
      uni.showToast({ title, icon: 'none' })
    }
  } = options

  const targetId = hasTargetValue(target.goodsId) ? target.goodsId : target.orderId
  if (!hasTargetValue(targetId)) {
    showToast(getMissingTargetMessage(target))
    return {
      ok: false
    }
  }

  try {
    const res = await openConversationRequest(target)
    const conversationId = res && res.data && res.data.id

    if (res && res.code === 0 && hasTargetValue(conversationId)) {
      navigateTo(buildChatDetailUrl(conversationId))
      return {
        ok: true,
        conversationId
      }
    }

    showToast((res && res.message) || '暂时无法进入聊天')
    return {
      ok: false
    }
  } catch {
    showToast('暂时无法进入聊天')
    return {
      ok: false
    }
  }
}
