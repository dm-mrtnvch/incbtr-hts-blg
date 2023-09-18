import jwt from 'jsonwebtoken'
import {UUID} from "mongodb";

export const jwtService = {
  async createJwt(userId: any) {
    const token = jwt.sign({userId}, '123', {expiresIn: '10 seconds'}) // 10 sec
    return {
      accessToken: token
    }
  },
  async createRefreshToken(userId: any) {
    return  jwt.sign({userId}, '456', {expiresIn: '20 seconds'}) // 20 sec
  },
  async getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(token, '123')
      return result.userId
    } catch (e){
      return null
    }
  },
  verifyJwt (token: string){
    return jwt.verify(token, '123', (err, decoded) => {
      console.log('decoded',decoded)
      console.log('error', err)
    })
  },
  verifyRefreshToken (token: string){
    try {
      const result: any =  jwt.verify(token, '456', (err, decoded) => {
        console.log('decoded',decoded)
        console.log('error', err)
      })
      return result.userId
    } catch (e){
      return null
    }
  }
}
