import request from '@/utils/request'

export const getCategories = async() =>
  await request({
    url: '/query?sql=select * from categories',
    method: 'get'
  })
