import {Request, Response, Router} from "express";
import {body} from "express-validator";
import {jwtService} from "../../application/jwt/jwt.service";
import {emailPattern, errorsValidation, passwordPattern} from "../../helpers/utils";
import {RequestWithBody} from "../../interfaces";
import {TokenAuthMiddleware} from "../../middlewares/middlewares";
import {usersRepository} from "../../repositories/users";
import {usersQueryRepository} from "../../repositories/users/query";
import {authService} from "../../services/auth.service";
import {usersService} from "../../services/users.service";
import {v4 as uuidv4} from 'uuid';

export const authRouter = Router()

authRouter.post('/login',
  body('loginOrEmail').notEmpty().trim(),
  body('password').notEmpty().trim(),
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
  async (req: Request, res: Response) => {
    const refreshTokenFromCookie = req.cookies.refreshToken
    if (!refreshTokenFromCookie) {
      res.sendStatus(401)
      return
    }

    const isTokenBlacklisted = await jwtService.isTokenExistInBlackList(refreshTokenFromCookie)
    if (isTokenBlacklisted) {
      res.sendStatus(401)
      return
    }

    await jwtService.addRefreshTokenToBlacklist(refreshTokenFromCookie)
    res.sendStatus(204)
  })

authRouter.get('/me',
  /// is refresh requires here?
  TokenAuthMiddleware,
  async (req: Request, res: Response) => {

    if (!req.userId) {
      res.sendStatus(401)
      return
    }

    const isJwtVerified = jwtService.getUserIdByJwt(req.userId)
    if (!isJwtVerified) {
      res.sendStatus(401)
      return
    }
    const user = await usersQueryRepository.getUserById(req.userId)

    if (!user) {
      res.sendStatus(401)
    } else {
      res.send({
        email: user.accountData.email,
        login: user.accountData.login,
        userId: user.id
      })
    }
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
  async (req: Request, res: Response) => {
    const currentRefreshToken = req.cookies.refreshToken
    if (currentRefreshToken) return res.sendStatus(401)

    const userId = jwtService.getUserIdByRefreshToken(currentRefreshToken)
    if (!userId) return res.sendStatus(401);

    const isTokenBlacklisted = await jwtService.isTokenExistInBlackList(currentRefreshToken)
    if (isTokenBlacklisted) return res.sendStatus(401);

    const user = usersQueryRepository.getUserById(userId)
    if (!user) return res.sendStatus(401)

    const newAccessToken = await jwtService.createJwt(userId)
    const newRefreshToken = await jwtService.createRefreshToken(userId)

    if (newAccessToken && newRefreshToken) {
      await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)

      return res
        .cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
        .send(newAccessToken)

    } else {
      return res.sendStatus(401)
    }
  })
