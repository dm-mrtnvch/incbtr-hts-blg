import bcrypt from "bcrypt";
import {randomUUID} from "crypto";
import add from "date-fns/add";
import {Request, Response, Router} from "express";
import {body} from "express-validator";
import {v4 as uuidv4} from "uuid";
import {emailAdapter} from "../adapters/emailAdapter";
import {jwtService} from "../application/jwt/jwt.service";

import {DeviceSessionModel, UserModel} from "../db/models";
import {emailPattern, errorsValidation, passwordPattern} from "../helpers/utils";
import {RequestWithBody} from "../interfaces";
import {
  AccessTokenAuthMiddleware,
  RefreshTokenAuthMiddleware, RequestErrorsValidationMiddleware,
  RequestsLimitMiddleware
} from "../middlewares/middlewares";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";
import {authService} from "../services/auth.service";
import {securityService} from "../services/security.service";
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

      const newSession = {
        ip: req.ip,
        title: req.headers['user-agent'] || 'asdf',
        deviceId,
        userId,
        lastActiveDate: jwtService.getLastActiveDateFromToken(refreshToken)
      }

      await securityService.createDeviceSession(newSession)
      //lastActiveDate === refresh token issuance time

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
    const device = await DeviceSessionModel.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    await securityService.deleteSessionByUserIdAndDeviceId(userId, deviceId)
    return res.clearCookie('refreshToken').status(204).send()
  })

authRouter.get('/me',
  RequestsLimitMiddleware,
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

authRouter.post('/password-recovery',
  RequestsLimitMiddleware,
  body('email').notEmpty().trim().isEmail().withMessage('incorrect body'),
  RequestErrorsValidationMiddleware,
  async (req: RequestWithBody<{ email: string }>, res: Response) => {
    const {email} = req.body

    const user = await usersQueryRepository.findUserByEmail(email)
    if (!user) {
      res.sendStatus(204)
      return
    }

    console.log('user', user)

    const passwordRecoveryCode = uuidv4()
    const expirationDate = add(new Date(), {hours: 1})
    const result = await emailAdapter.recoverUserPassword(email, passwordRecoveryCode)

    if (result.messageId) {
      await usersRepository.updateUserRecoveryPasswordCode(user.id, passwordRecoveryCode, expirationDate)
    }
    /// gcheck
    res.sendStatus(204)
  })

authRouter.post('/new-password',
  RequestsLimitMiddleware,
  body('newPassword').notEmpty().trim().isLength({min: 6, max: 20}).withMessage('incorrect new password'),
  body('recoveryCode').notEmpty().trim()
    .custom(async (recoveryCode: string) => {
      const user = await usersQueryRepository.findUserByPasswordRecoveryCode(recoveryCode)
      if (user?.passwordRecovery?.recoveryCode !== recoveryCode) {
        throw new Error('incorrect recovery code')
      }
    })
    .withMessage('incorrect recovery code'),
  RequestErrorsValidationMiddleware,
  async (req: RequestWithBody<{ newPassword: string, recoveryCode: string }>, res: Response) => {
    const {newPassword, recoveryCode} = req.body

    const user = await usersQueryRepository.findUserByPasswordRecoveryCode(recoveryCode)

    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await authService._generateHash(newPassword, passwordSalt)

    await UserModel
      .updateOne({id: user?.id}, {
        $set: {
          'accountData.passwordSalt': passwordSalt,
          'accountData.passwordHash': passwordHash
        }
      })

    res.sendStatus(204)
  })

authRouter.post('/refresh-token',
  RequestsLimitMiddleware,

  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    const {userId, deviceId, iat} = req.jwtPayload
    const device = await DeviceSessionModel.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    const newAccessToken = await jwtService.createJwt(userId)
    const newRefreshToken = await jwtService.createRefreshToken(userId, deviceId)

    if (newAccessToken && newRefreshToken) {
      // await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)

      const lastActiveDate = jwtService.getLastActiveDateFromToken(newRefreshToken)
      await securityService.updateDeviceSessionLastActiveDate(userId, deviceId, lastActiveDate)

      res.cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
      res.send(newAccessToken)
      return

    } else {
      return res.sendStatus(401)
    }
  })
