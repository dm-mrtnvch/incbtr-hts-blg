import {JwtPayload} from "../../application/jwt/jwt.service";


export declare global {
  namespace Express {
    export interface Request {
      userId: string
      jwtPayload: JwtPayload
    }
  }
}
