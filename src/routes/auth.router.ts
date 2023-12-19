import {Router} from "express";
import {body} from "express-validator";
import {AuthController} from "../controllers/auth.controller";

import {emailPattern, passwordPattern} from "../helpers/utils";
import {container} from "../inversify/inversify.config";
import {
  AccessTokenAuthMiddleware,
  RefreshTokenAuthMiddleware,
  RequestErrorsValidationMiddleware,
  RequestsLimitMiddleware
} from "../middlewares/middlewares";
import {UsersQueryRepository} from "../repositories/users/query";

const authController = container.resolve(AuthController)
const usersQueryRepository = container.resolve(UsersQueryRepository)
export const authRouter = Router()

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



