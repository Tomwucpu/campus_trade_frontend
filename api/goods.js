import { request } from '../utils/request'

export function getGoodsList(params) {
  return request({
    url: '/goods',
    method: 'GET',
    data: params
  })
}

export function getGoodsDetail(id) {
  return request({
    url: `/goods/${id}`,
    method: 'GET'
  })
}
