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

export function createGoods(data) {
  return request({
    url: '/goods',
    method: 'POST',
    data
  })
}

export function getGoodsCategories() {
  return request({
    url: '/goods/categories',
    method: 'GET'
  })
}
