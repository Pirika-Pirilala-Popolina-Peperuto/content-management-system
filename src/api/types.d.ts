
export interface IProductData {
  id?: string
  name: string
  description: string
  price: number
  picture_url: string
  picture_id:string
  quantity: number
  category_id: string
}

export interface ICategoryData {
  id: string
  name: string
}

export interface IRoleData {
  key: string
  name: string
  description: string
  routes: any
}

export interface ITransactionData {
  orderId: string
  timestamp: string | number
  username: string
  price: number
  status: string
}

export interface IUserData {
  id: number
  username: string
  password: string
  name: string
  email: string
  phone: string
  avatar: string
  introduction: string
  roles: string[]
}
