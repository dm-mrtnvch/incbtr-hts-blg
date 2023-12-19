import bcrypt from "bcrypt";
import {randomUUID} from "crypto";
import add from "date-fns/add";
import {Request, Response, Router} from "express";
import {body} from "express-validator";
import {v4 as uuidv4} from "uuid";
import {EmailAdapter} from "../adapters/emailAdapter";
import {JwtService} from "../application/jwt/jwt.service";
import {authController, usersQueryRepository} from "../compostion-root";
import {DeviceSessionModel, UserModel} from "../db/models";
import {emailPattern, passwordPattern} from "../helpers/utils";
import {RequestWithBody} from "../interfaces";
import {
  AccessTokenAuthMiddleware,
  RefreshTokenAuthMiddleware,
  RequestErrorsValidationMiddleware,
  RequestsLimitMiddleware
} from "../middlewares/middlewares";
import {UsersRepository} from "../repositories/users";
import {UsersQueryRepository} from "../repositories/users/query";
import {AuthService} from "../services/auth.service";
import {SecurityService} from "../services/security.service";
import {UsersService} from "../services/users.service";

export const authRouter = Router()

export class AuthController {
  constructor(
    protected authService: AuthService,
    protected jwtService: JwtService,
    protected securityService: SecurityService,
    protected usersService: UsersService,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected emailAdapter: EmailAdapter) {
  }

  async login(req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: Response) {
    const {loginOrEmail, password} = req.body

    const userId = await this.authService.checkCredentials(loginOrEmail, password)
    if (userId) {

      //TODO; remove uuid library
      const deviceId = randomUUID()
      const accessToken = await this.jwtService.createJwt(userId)
      const refreshToken = await this.jwtService.createRefreshToken(userId, deviceId)

      const newSession = {
        ip: req.ip,
        title: req.headers['user-agent'] || 'asdf',
        deviceId,
        userId,
        lastActiveDate: this.jwtService.getLastActiveDateFromToken(refreshToken)
      }

      await this.securityService.createDeviceSession(newSession)
      //lastActiveDate === refresh token issuance time

      res
        .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        .send(accessToken)

    } else {
      res.sendStatus(401)
    }
  }

  async logout(req: Request, res: Response) {
    // await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)
    const {userId, deviceId, iat} = req.jwtPayload
    const device = await DeviceSessionModel.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    await this.securityService.deleteSessionByUserIdAndDeviceId(userId, deviceId)
    return res.clearCookie('refreshToken').status(204).send()
  }

  async me(req: Request, res: Response) {
    const user = await this.usersQueryRepository.getUserById(req.userId)

    res.send({
      email: user.accountData.email,
      login: user.accountData.login,
      userId: user.id
    })

  }

  async registration(req: RequestWithBody<{ login: string, password: string, email: string }>, res: Response) {
    const {login, email, password} = req.body
    const user = await this.usersService.createUserByRegistration(login, password, email)

    if (user) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  }

  async registrationConfirmation(req: RequestWithBody<{ code: string }>, res: Response) {
    const {code} = req.body
    const isConfirmed = await this.authService.confirmEmail(code)

    if (isConfirmed) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  }

  async registrationEmailResending(req: RequestWithBody<{ email: string }>, res: Response) {
    const {email} = req.body
    const resendEmailResult: any = await this.authService.resendRegistrationConfirmEmail(email)

    if (resendEmailResult.messageId) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  }

  async passwordRecovery(req: RequestWithBody<{ email: string }>, res: Response) {
    const {email} = req.body
    const user = await this.usersQueryRepository.findUserByEmail(email)

    if (!user) {
      res.sendStatus(204)
      return
    }

    const passwordRecoveryCode = uuidv4()
    const expirationDate = add(new Date(), {hours: 1})
    const result = await this.emailAdapter.recoverUserPassword(email, passwordRecoveryCode)

    if (result.messageId) {
      await this.usersRepository.updateUserRecoveryPasswordCode(user.id, passwordRecoveryCode, expirationDate)
    }
    res.sendStatus(204)
  }

  async newPassword(req: RequestWithBody<{ newPassword: string, recoveryCode: string }>, res: Response) {
    const {newPassword, recoveryCode} = req.body
    const user = await this.usersQueryRepository.findUserByPasswordRecoveryCode(recoveryCode)
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this.authService._generateHash(newPassword, passwordSalt)

    await UserModel
      .updateOne({id: user?.id}, {
        $set: {
          'accountData.passwordSalt': passwordSalt,
          'accountData.passwordHash': passwordHash
        }
      })

    res.sendStatus(204)
  }

  async refreshToken(req: Request, res: Response) {
    const {userId, deviceId, iat} = req.jwtPayload
    const device = await DeviceSessionModel.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    const newAccessToken = await this.jwtService.createJwt(userId)
    const newRefreshToken = await this.jwtService.createRefreshToken(userId, deviceId)

    if (newAccessToken && newRefreshToken) {
      // await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)
      const lastActiveDate = this.jwtService.getLastActiveDateFromToken(newRefreshToken)
      await this.securityService.updateDeviceSessionLastActiveDate(userId, deviceId, lastActiveDate)

      res.cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
      res.send(newAccessToken)
      return
    } else {
      return res.sendStatus(401)
    }
  }
}


authRouter.post('/login',
  RequestsLimitMiddleware,
  body('loginOrEmail').notEmpty().trim(),
  body('password').notEmpty().trim(),
  // checkSchema({
  //   loginOrEmail: { notEmpty: true, trim: true},
  //   password: { notEmpty: true, trim: true},
  // }),
  authController.login.bind(authController)
)

authRouter.post('/logout',
  RequestsLimitMiddleware,
  RefreshTokenAuthMiddleware,
  authController.logout.bind(authController)
)

authRouter.get('/me',
  RequestsLimitMiddleware,
  /// is refresh requires here?
  AccessTokenAuthMiddleware,
  authController.me.bind(authController)
)

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
  RequestErrorsValidationMiddleware,
  authController.registration.bind(authController)
)

authRouter.post('/registration-confirmation',
  RequestsLimitMiddleware,
  RequestErrorsValidationMiddleware,
  body('code').notEmpty().trim().custom(async (code) => {
    const user = await usersQueryRepository.findUserByConfirmationCode(code)
    if (user.emailConfirmation.isConfirmed) {
      throw new Error('already confirmed')
    }
  }).withMessage('user is already confirmed'),
  authController.registrationConfirmation.bind(authController)
)

authRouter.post('/registration-email-resending',
  RequestsLimitMiddleware,
  RequestErrorsValidationMiddleware,
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
  authController.registrationEmailResending.bind(authController)
)

authRouter.post('/password-recovery',
  RequestsLimitMiddleware,
  body('email').notEmpty().trim().isEmail().withMessage('incorrect body'),
  RequestErrorsValidationMiddleware,
  authController.passwordRecovery.bind(authController)
)

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
  authController.newPassword.bind(authController)
)

authRouter.post('/refresh-token',
  RequestsLimitMiddleware,
  RefreshTokenAuthMiddleware,
  authController.refreshToken.bind(authController)
)
