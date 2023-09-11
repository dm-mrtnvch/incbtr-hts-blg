import jwt from 'jsonwebtoken'
import {UUID} from "mongodb";

export const jwtService = {
  async createJwt(userId: any) {
    return jwt.sign({userId}, '123', {expiresIn: '2 days'})
  },
  async getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(token, '123')
      return result.userId
    } catch (e){
      return null
    }
  }
}
