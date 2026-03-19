import { request } from '../utils/request'

export function getOrderList(params) {
  return request({
    url: '/orders',
    method: 'GET',
    data: params
  })
}
