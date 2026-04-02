import { request } from '../utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  })
}

export function register(data) {
  return request({
    url: '/auth/register',
    method: 'POST',
    data
  })
}

export function getProfile() {
  return request({
    url: '/auth/profile',
    method: 'GET'
  })
}

export function bindCampusManual(data) {
  return request({
    url: '/auth/campus/manual',
    method: 'PUT',
    data
  })
}

export function bindCampusByLocation(data) {
  return request({
    url: '/auth/campus/location',
    method: 'PUT',
    data
  })
}

export function resolveCampusByLocation(data) {
  return request({
    url: '/auth/campus/resolve',
    method: 'POST',
    data
  })
}
