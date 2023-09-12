import {NextFunction, Request, Response} from "express";
import {jwtService} from "../application/jwt/jwt.service";
import {usersQueryRepository} from "../repositories/users/query";
import {usersService} from "../services/users.service";

export const BasicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const adminCredentials = 'YWRtaW46cXdlcnR5'

  // is it necessary to check req.headers.authorization firstly
  if(req.headers.authorization && req.headers.authorization === `Basic ${adminCredentials}`){
    next()
  } else {
    res.sendStatus(401)
  }
};

export const TokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(401)
    return
  }

  const token = req.headers.authorization.split(' ')[1]
  const userId = await jwtService.getUserIdByToken(token)

  if (!userId) {
    res.sendStatus(401)
    return
  }

  const user =  await usersQueryRepository.getUserById(userId)

  if(!user) {
    res.sendStatus(401)
    return
  }
  req.userId = userId
  next()
}
