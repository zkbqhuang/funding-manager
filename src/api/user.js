import request from '@/plugin/axios'

export function Login (data) {
  return request({
    url: 'manager/user/login',
    method: 'post',
    data
  })
}

export function Info (data) {
  return request({
    url: 'manager/user/info',
    method: 'get',
    data
  })
}

export function Logout (data) {
  return request({
    url: 'manager/user/logout',
    method: 'post',
    data
  })
}
