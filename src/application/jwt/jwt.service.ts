import jwt from 'jsonwebtoken'
// import {expiredTokensCollection} from "../../db/db";
const accessTokenSecret = '123'

export type JwtPayload = {
  userId: string,
  deviceId: string,
  iat: number,
  exp: number
}

export class JwtService  {
  async createJwt(userId: string) {
    try {
      const token = jwt.sign({userId}, accessTokenSecret, {expiresIn: '100000000s'}) // 10 sec
      return {
        accessToken: token
      }
    } catch (e) {
      return null
    }
  }
  async createRefreshToken(userId: any, deviceId: string) {
    return jwt.sign({userId, deviceId}, '456', {expiresIn: '200000000s'}) // 20 sec
  }
  getUserIdByJwt(token: string) {
    try {
      const res: any = jwt.verify(token, accessTokenSecret)
      return res.userId
    } catch (e) {
      console.log(e)
      return null
    }
  }
  verifyJwt(token: string) {
    return jwt.verify(token, '123')
  }
  getUserIdByRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, '456') as JwtPayload
    } catch (e) {
      return null
    }
  }
  getLastActiveDateFromToken(token: string) {
    const payload: any = jwt.decode(token)
    return new Date(payload.iat * 1000).toISOString()

  }
  // getCurrentDeviceIdByToken(token: string) {
  //   const payload: any = jwt.decode(token)
  //   return payload.deviceId
  //
  // },
  // async addRefreshTokenToBlacklist(token: string) {
  //   return  expiredTokensCollection.insertOne({token})
  //
  //
  // },
  // async isRefreshTokenExistInBlackList(token: string) {
  //   return expiredTokensCollection.findOne({token})
  // }
}

export const jwtService = new JwtService()
