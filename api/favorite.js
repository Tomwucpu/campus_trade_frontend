import { request } from '../utils/request'

export function getFavoriteList(params) {
  return request({
    url: '/favorites',
    method: 'GET',
    data: params
  })
}

export function addFavorite(goodsId) {
  return request({
    url: `/favorites/${goodsId}`,
    method: 'POST'
  })
}

export function removeFavorite(goodsId) {
  return request({
    url: `/favorites/${goodsId}`,
    method: 'DELETE'
  })
}
