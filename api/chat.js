import { request } from '../utils/request'

function hasTargetValue(value) {
  return !(value === '' || value === null || typeof value === 'undefined')
}

export function getConversationList(params) {
  return request({
    url: '/chat/conversations',
    method: 'GET',
    data: params
  })
}

export function getChatUnreadCount() {
  return request({
    url: '/chat/unread-count',
    method: 'GET'
  })
}

export function openConversation(target = {}) {
  if (hasTargetValue(target.goodsId)) {
    return request({
      url: `/chat/conversations/from-goods/${target.goodsId}`,
      method: 'POST'
    })
  }

  if (hasTargetValue(target.orderId)) {
    return request({
      url: `/chat/conversations/from-order/${target.orderId}`,
      method: 'POST'
    })
  }

  return Promise.reject(new Error('缺少会话目标'))
}

export function getConversationDetail(id) {
  return request({
    url: `/chat/conversations/${id}`,
    method: 'GET'
  })
}

export function getConversationMessages(id, params) {
  return request({
    url: `/chat/conversations/${id}/messages`,
    method: 'GET',
    data: params
  })
}

export function sendChatMessage(id, data) {
  return request({
    url: `/chat/conversations/${id}/messages`,
    method: 'POST',
    data
  })
}

export function clearConversationMessages(id) {
  return request({
    url: `/chat/conversations/${id}/messages`,
    method: 'DELETE'
  })
}
