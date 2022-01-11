import request from '@/utils/request'
import { IProductData } from './types'

export const defaultProductData: IProductData = {
  name: '',
  description: '',
  price: 0,
  picture_url: '',
  quantity: 0,
  category_id: '',
  picture_id: ''
}

export const getProducts = async() =>
  await request({
    url: '/query?sql=select *, products.id as id from products join pictures on products.picture_id=pictures.id join product_categories on products.id=product_categories.product_id order by products.id',
    method: 'get'
  })

// export const getArticle = (id: number, params: any) =>
//   request({
//     url: `/articles/${id}`,
//     method: 'get',
//     params
//   })

export const createProducts = async(product: IProductData) => {
  const pictureRes = await request({
    url: `/query?sql=insert into pictures (picture_url) values ('${product.picture_url}') returning id`,
    method: 'get'
  })
  if (pictureRes.data.length < 1) {
    return
  }

  const productRes = await request({
    url: `/query?sql=INSERT INTO products(name,description,price,picture_id,quantity) VALUES ('${product.name}','${product.description}',${product.price},'${pictureRes.data[0].id}',${product.quantity}) returning id`,
    method: 'get'
  })
  if (productRes.data.length < 1) {
    return
  }

  const categoryRes = await request({
    url: `/query?sql=insert into product_categories (category_id, product_id) values ('${product.category_id}', '${productRes.data[0].id}')  returning product_id`,
    method: 'get'
  })
  if (categoryRes.data.length < 1) {
    return
  }
  return { ...product, id: productRes.data[0].id, picture_id: pictureRes.data[0].id }
}

export const updateProduct = async(id: string, product: IProductData) => {
  const pictureRes = await request({
    url: `/query?sql=update pictures SET picture_url='${product.picture_url}' where id='${product.picture_id}' returning id`,
    method: 'get'
  })
  if (pictureRes.data.length < 1) {
    return
  }

  const productRes = await request({
    url: `/query?sql=update products SET name='${product.name}',description='${product.description}',price=${product.price},quantity=${product.quantity} where id='${product.id}' returning id`,
    method: 'get'
  })
  if (productRes.data.length < 1) {
    return
  }

  const categoryRes = await request({
    url: `/query?sql=update product_categories SET category_id='${product.category_id}' where product_id='${product.id}' returning product_id`,
    method: 'get'
  })
  if (categoryRes.data.length < 1) {
    return
  }
  return { ...product }
}

export const deleteProducts = async(id: number) => {
  const categoryRes = await request({
    url: `/query?sql=delete from product_categories where product_id='${id}' returning product_id`,
    method: 'get'
  })
  if (categoryRes.data.length < 1) {
    return
  }

  const productRes = await request({
    url: `/query?sql=delete from products where id='${id}' returning id`,
    method: 'get'
  })
  if (productRes.data.length < 1) {
    return
  }

  return { id }
}

export const getPageviews = (params: any) =>
  request({
    url: '/pageviews',
    method: 'get',
    params
  })
