import jwt from 'jsonwebtoken'
import {UUID} from "mongodb";
import {expiredTokensCollection} from "../../db/db";
const accessTokenSecret = '123'
export const jwtService = {
  async createJwt(userId: string) {
    try {
      const token = jwt.sign({userId}, accessTokenSecret, {expiresIn: '10s'}) // 10 sec
      return {
        accessToken: token
      }
    } catch (e) {
      return null
    }
  },
  async createRefreshToken(userId: any) {
    return jwt.sign({userId}, '456', {expiresIn: '20s'}) // 20 sec
  },
  async getUserIdByJwt(token: string) {
    try {
      const result: any = jwt.verify(token, accessTokenSecret)
      return result.userId
    } catch (e) {
      console.log(e)
      return null
    }
  },
  verifyJwt(token: string) {
    return jwt.verify(token, '123')
  },
  getUserIdByRefreshToken(token: string) {
    try {
      const result: any = jwt.verify(token, '456')
      return result.userId
    } catch (e) {
      return null
    }
  },
  async addRefreshTokenToBlacklist(token: string) {
    return  expiredTokensCollection.insertOne({token})


  },
  async isRefreshTokenExistInBlackList(token: string) {
    return expiredTokensCollection.findOne({token})
  }
}
