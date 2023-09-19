import {Request, Response, Router} from "express";
import {body, checkSchema} from "express-validator";
import {jwtService} from "../../application/jwt/jwt.service";
import {emailPattern, errorsValidation, passwordPattern} from "../../helpers/utils";
import {RequestWithBody} from "../../interfaces";
import {AccessTokenAuthMiddleware, RefreshTokenAuthMiddleware} from "../../middlewares/middlewares";
import {usersRepository} from "../../repositories/users";
import {usersQueryRepository} from "../../repositories/users/query";
import {authService} from "../../services/auth.service";
import {usersService} from "../../services/users.service";

export const authRouter = Router()

authRouter.post('/login',
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
      const response = await jwtService.createJwt(userId)
      const refreshToken = await jwtService.createRefreshToken(userId)

      res
        .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        .send(response)

    } else {
      res.sendStatus(401)
    }
  })

authRouter.post('/logout',
  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)
    return res.clearCookie('refreshToken').status(204).send()
  })

authRouter.get('/me',
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
  body('code').notEmpty().trim().custom(async (code) => {
    const user = await usersRepository.findUserByConfirmationCode(code)

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
  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    console.log(req.userId, 'rt router')
    const newAccessToken = await jwtService.createJwt(req.userId)
    const newRefreshToken = await jwtService.createRefreshToken(req.userId)

    if (newAccessToken && newRefreshToken) {
      await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)

      res.cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
      res.send(newAccessToken)
      return

    } else {
      return res.sendStatus(401)
    }
  })
