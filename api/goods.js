import { request, uploadFile } from '../utils/request'

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

export function getMyGoodsList(params) {
  return request({
    url: '/goods/mine',
    method: 'GET',
    data: params
  })
}

export function createGoods(data) {
  return request({
    url: '/goods',
    method: 'POST',
    data
  })
}

export function updateGoods(id, data) {
  return request({
    url: `/goods/${id}`,
    method: 'PUT',
    data
  })
}

export function onSaleGoods(id) {
  return request({
    url: `/goods/${id}/on-sale`,
    method: 'POST'
  })
}

export function offSaleGoods(id) {
  return request({
    url: `/goods/${id}/off-sale`,
    method: 'POST'
  })
}

export function getGoodsCategories() {
  return request({
    url: '/goods/categories',
    method: 'GET'
  })
}

export function uploadGoodsImage(filePath) {
  return uploadFile({
    url: '/files/images',
    filePath,
    name: 'file'
  })
}
