import jwt from 'jsonwebtoken'
import {UUID} from "mongodb";
import {expiredTokensCollection} from "../../db/db";

export const jwtService = {
  async createJwt(userId: any) {
    try {
      const token = jwt.sign({userId}, '123', {expiresIn: 10111}) // 10 sec
      return {
        accessToken: token
      }
    } catch (e) {
      return null
    }
  },
  async createRefreshToken(userId: any) {
    return jwt.sign({userId}, '456', {expiresIn: 2011111}) // 20 sec
  },
  async getUserIdByJwt(token: string) {
    try {
      const result: any = jwt.verify(token, '123')
      return result.userId
    } catch (e) {
      return null
    }
  },
  verifyJwt(token: string) {
    return jwt.verify(token, '123', (err, decoded) => {
      console.log('decoded', decoded)
      console.log('error', err)
    })
  },
  getUserIdByRefreshToken(token: string) {
    try {
      const result: any = jwt.verify(token, '456', (err, decoded) => {
        console.log('decoded', decoded)
        console.log('error', err)
      })
      return result.userId
    } catch (e) {
      return null
    }
  },
  async addRefreshTokenToBlacklist(token: string) {
    return  expiredTokensCollection.insertOne({token})


  },
  async isTokenExistInBlackList(token: string) {
    return expiredTokensCollection.findOne({token})
  }
}
