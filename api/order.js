import { request } from '../utils/request'

export function getOrderList(params) {
  return request({
    url: '/orders',
    method: 'GET',
    data: params
  })
}

export function getOrderDetail(id) {
  return request({
    url: `/orders/${id}`,
    method: 'GET'
  })
}

export function createOrder(data) {
  return request({
    url: '/orders',
    method: 'POST',
    data
  })
}

export function payOrder(id) {
  return request({
    url: `/orders/${id}/pay`,
    method: 'POST'
  })
}

export function shipOrder(id) {
  return request({
    url: `/orders/${id}/ship`,
    method: 'POST'
  })
}

export function completeOrder(id) {
  return request({
    url: `/orders/${id}/complete`,
    method: 'POST'
  })
}

export function cancelOrder(id) {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'POST'
  })
}

export function deleteOrder(id) {
  return request({
    url: `/orders/${id}`,
    method: 'DELETE'
  })
}
