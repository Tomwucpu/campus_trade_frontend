import { request } from '../utils/request'

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

export function openConversationByGoods(goodsId) {
  return request({
    url: `/chat/conversations/from-goods/${goodsId}`,
    method: 'POST'
  })
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
