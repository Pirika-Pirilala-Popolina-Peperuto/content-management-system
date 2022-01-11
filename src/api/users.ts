import request from '@/utils/request'

export const getUserInfo = async(token: string) => {
  const { 0: email, 1: password } = token.split(':')
  const res = await request({
    url: `/query?sql=select * from users where email='${email}' and password='${password}' and user_type='admin'`,
    method: 'get'
  })
  if (res.data.length < 1) {
    return { data: undefined }
  }
  console.log(res.data)
  return {
    data: {
      user: {
        id: res.data[0].id,
        username: res.data[0].name,
        password: res.data[0].password,
        name: res.data[0].name,
        avatar:
          'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        introduction: 'I am a super administrator',
        email: res.data[0].email,
        phone: '1234567890',
        roles: ['admin']
      }
    }
  }
}

export const login = async(data:{email:string, password:string}) => {
  const { email, password } = data
  const res = await request({
    url: `/query?sql=select * from users where email='${email}' and password='${password}' and user_type='admin'`,
    method: 'get'
  })

  if (res.data.length < 1) {
    return { data: { accessToken: '' } }
  } else {
    return { data: { accessToken: email + ':' + password } }
  }
}

export const logout = () => { return undefined }
