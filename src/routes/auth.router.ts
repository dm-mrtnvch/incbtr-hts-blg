import {randomUUID} from "crypto";
import {Request, Response, Router} from "express";
import {body, checkSchema} from "express-validator";
import {jwtService} from "../application/jwt/jwt.service";
import {deviceSessionsCollection} from "../db/db";
import {emailPattern, errorsValidation, passwordPattern} from "../helpers/utils";
import {RequestWithBody} from "../interfaces";
import {
  AccessTokenAuthMiddleware,
  RequestsLimitMiddleware,
  RefreshTokenAuthMiddleware
} from "../middlewares/middlewares";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";
import {authService} from "../services/auth.service";
import {usersService} from "../services/users.service";

export const authRouter = Router()

authRouter.post('/login',
  RequestsLimitMiddleware,
  body('loginOrEmail').notEmpty().trim(),
  body('password').notEmpty().trim(),
  // checkSchema({
  //   loginOrEmail: { notEmpty: true, trim: true},
  //   password: { notEmpty: true, trim: true},
  // }),
  async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: Response) => {
    const {loginOrEmail, password} = req.body

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const userId = await authService.checkCredentials(loginOrEmail, password)

    if (userId) {

      //TODO; remove uuid library
      const deviceId = randomUUID()
      const accessToken = await jwtService.createJwt(userId)
      const refreshToken = await jwtService.createRefreshToken(userId, deviceId)

      await deviceSessionsCollection.insertOne({
        ip: req.ip,
        title: req.headers['user-agent'] || 'asdf',
        deviceId,
        userId,
        lastActiveDate: jwtService.getLastActiveDateFromToken(refreshToken)
      })

      //lastActiveDate === время выписки рефреш токена

      res
        .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        .send(accessToken)

    } else {
      res.sendStatus(401)
    }
  })

authRouter.post('/logout',
  RequestsLimitMiddleware,
  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    // await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)
    const {userId, deviceId, iat} = req.jwtPayload
    const device = await deviceSessionsCollection.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    await deviceSessionsCollection.deleteOne({deviceId, userId})
    return res.clearCookie('refreshToken').status(204).send()
  })

authRouter.get('/me',
  RequestsLimitMiddleware,

  /// is refresh requires here?
  /// is refresh requires here?
  AccessTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    const user = await usersQueryRepository.getUserById(req.userId)


    res.send({
      email: user.accountData.email,
      login: user.accountData.login,
      userId: user.id
    })

  })

authRouter.post('/registration',
  RequestsLimitMiddleware,

  body('login').trim().notEmpty().isLength({min: 3, max: 10})
    .custom(async (login) => {
      const userWithLogin = await usersQueryRepository.findUserByLogin(login);
      if (userWithLogin) {
        throw new Error('login is busy');
      }
    }).withMessage('this login is already exist'),
  body('password').notEmpty().trim().isLength({min: 6, max: 20}).matches(passwordPattern),
  body('email').notEmpty().trim().isEmail().matches(emailPattern)
    .custom(async (email) => {
      const userWithEmail = await usersQueryRepository.findUserByEmail(email)
      if (userWithEmail) {
        throw new Error('email is busy')
      }
    }).withMessage('this email is already exist'),
  async (req: RequestWithBody<{ login: string, password: string, email: string }>, res: Response) => {

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const {login, email, password} = req.body


    const user = await usersService.createUserByRegistration(login, password, email)

    if (user) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  })

authRouter.post('/registration-confirmation',
  RequestsLimitMiddleware,

  body('code').notEmpty().trim().custom(async (code) => {
    const user = await usersQueryRepository.findUserByConfirmationCode(code)

    if (user.emailConfirmation.isConfirmed) {
      throw new Error('already confirmed')
    }
  }).withMessage('user is already confirmed'),
  async (req: RequestWithBody<{ code: string }>, res: Response) => {

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const {code} = req.body

    const isConfirmed = await authService.confirmEmail(code)

    if (isConfirmed) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  })

authRouter.post('/registration-email-resending',
  RequestsLimitMiddleware,
  body('email').notEmpty().trim().isEmail().matches(emailPattern)
    .custom(async (email) => {
      const user = await usersQueryRepository.findUserByEmail(email)
      if (!user) {
        throw new Error('no email')
      }

      if (user.emailConfirmation.isConfirmed) {
        throw new Error('already confirmed')
      }

    }).withMessage('email'),
  async (req: RequestWithBody<{ email: string }>, res: Response) => {

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const {email} = req.body

    const resendEmailResult: any = await authService.resendRegistrationConfirmEmail(email)

    if (resendEmailResult.messageId) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  })

authRouter.post('/refresh-token',
  RequestsLimitMiddleware,

  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    const {userId, deviceId, iat} = req.jwtPayload
    const device = await deviceSessionsCollection.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    const newAccessToken = await jwtService.createJwt(userId)
    const newRefreshToken = await jwtService.createRefreshToken(userId, deviceId)

    if (newAccessToken && newRefreshToken) {
      // await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)

      const lastActiveDate = jwtService.getLastActiveDateFromToken(newRefreshToken)
      await deviceSessionsCollection.updateOne({userId, deviceId}, {$set: {lastActiveDate}})

      res.cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
      res.send(newAccessToken)
      return

    } else {
      return res.sendStatus(401)
    }
  })
