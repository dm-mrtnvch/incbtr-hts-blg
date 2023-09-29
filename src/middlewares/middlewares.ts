import {NextFunction, Request, Response} from "express";
import {ValidationError, validationResult} from "express-validator";
import {jwtService} from "../application/jwt/jwt.service";
import {RequestsModel} from "../db/db";
import {RequestErrorsValidationType} from "../interfaces";
import {usersQueryRepository} from "../repositories/users/query";
import {requestsService} from "../services/requests.service";

export const BasicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const adminCredentials = 'YWRtaW46cXdlcnR5'

  // is it necessary to check req.headers.authorization firstly
  if (req.headers.authorization && req.headers.authorization === `Basic ${adminCredentials}`) {
    next()
  } else {
    res.sendStatus(401)
  }
};

export const AccessTokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization
  if (!auth) {
    res.sendStatus(401)
    return
  }

  const [_, token] = auth.split(' ')
  const userId = await jwtService.getUserIdByJwt(token)
  if (!userId) {
    console.log('no userId')
    res.sendStatus(401)
    return
  }
  const user = await usersQueryRepository.getUserById(userId)

  if (!user) {
    res.sendStatus(401)
    return
  }
  console.log(user, 'in at')
  req.userId = userId
  next()
}

export const RefreshTokenAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const currentRefreshToken = req.cookies.refreshToken
  if (!currentRefreshToken) {
    console.log('no token')
    return res.sendStatus(401)
  }

  const payload = jwtService.getUserIdByRefreshToken(currentRefreshToken)
  if (!payload) {
    console.log('invalid token')
    return res.sendStatus(401);
  }

  // const isRefreshTokenBlacklisted = await jwtService.isRefreshTokenExistInBlackList(currentRefreshToken)
  // if (isRefreshTokenBlacklisted) {
  //   console.log('token block')
  //   return res.sendStatus(401);
  // }

  const user = await usersQueryRepository.getUserById(payload.userId)
  if (!user) {
    console.log('no user')
    return res.sendStatus(401)
  }

  console.log(user)
  req.userId = payload.userId
  req.jwtPayload = payload
  return next()
}


export const RequestErrorsValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const validationErrors: ValidationError[] = validationResult(req).array({onlyFirstError: true})

  if (validationErrors.length) {
    const errorMessages: RequestErrorsValidationType[] = []
    validationErrors.forEach((error: any) => {
      errorMessages.push({
        field: error.path,
        message: error.msg
      })
    })
    return res.status(400).send({errorsMessages: errorMessages})
  } else {
    return next()
  }
}

export const PaginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const validationErrors: ValidationError[] = validationResult(req).array({onlyFirstError: true})

  if (validationErrors.length) {
    const errorMessages: RequestErrorsValidationType[] = []
    validationErrors.forEach((error: any) => {
      errorMessages.push({
        field: error.path,
        message: error.msg
      })
    })
    return res.status(400).send({errorsMessages: errorMessages})
  } else {
    return next()
  }
}


export const RequestsLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const URL = req.baseUrl + req.url
  const IP = req.ip
  const date = new Date(Date.now() - 10 * 1000)

  const newRequest = {
    URL,
    IP,
    date: new Date()
  }

  const count = await RequestsModel.countDocuments({URL, IP, date: {$gte: date}})

  if (count + 1 > 5) {
    res.sendStatus(429)
    return
  } else {
    await requestsService.increaseRequestCount(newRequest)
    return next()
  }
}


