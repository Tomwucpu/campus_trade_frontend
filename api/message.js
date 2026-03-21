import { request } from '../utils/request'

export function getMessageList(params) {
  return request({
    url: '/messages',
    method: 'GET',
    data: params
  })
}

export function getUnreadMessageCount() {
  return request({
    url: '/messages/unread-count',
    method: 'GET'
  })
}

export function markAllMessagesRead() {
  return request({
    url: '/messages/read-all',
    method: 'POST'
  })
}
