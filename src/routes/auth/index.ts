import {el} from "date-fns/locale";
import {Router, Response, Request} from "express";
import {body} from "express-validator";
import {jwtService} from "../../application/jwt/jwt.service";
import {emailPattern, errorsValidation, passwordPattern} from "../../helpers/utils";
import {RequestWithBody} from "../../interfaces";
import {TokenAuthMiddleware} from "../../middlewares/middlewares";
import {emailAdapter} from "../../adapters/emailAdapter";
import {usersRepository} from "../../repositories/users";
import {usersQueryRepository} from "../../repositories/users/query";
import {authService} from "../../services/auth.service";
import {usersService} from "../../services/users.service";
import nodemailer from 'nodemailer'

export const authRouter = Router()

authRouter.post('/login',
  body('loginOrEmail').notEmpty().trim().isLength({min: 1}),
  body('password').notEmpty().trim().isLength({min: 1}),
  // async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: Response) => {
  async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const userId = await usersService.checkCredentials(loginOrEmail, password)

    if (userId) {
      const response = await jwtService.createJwt(userId)
      res.send(response)
    } else {
      res.sendStatus(401)
    }
  })

authRouter.get('/me',
  TokenAuthMiddleware,
  async (req: Request, res: Response) => {

    if (!req.userId) {
      res.sendStatus(401)
      return
    }

    const user = await usersQueryRepository.getUserById(req.userId)
    console.log('u', user)
    if (!user) {
      res.sendStatus(401)
    } else {
      res.send({
        email: user.email,
        login: user.login,
        userId: user.id
      })
    }
  })

authRouter.post('/registration',
  body('login').notEmpty().trim().isLength({min: 3, max: 10}),
  body('password').notEmpty().trim().isLength({min: 6, max: 30}).matches(passwordPattern),
  body('email').notEmpty().trim().matches(emailPattern),
  async (req: RequestWithBody<{ login: string, password: string, email: string }>, res: Response) => {

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const {login, email, password} = req.body

    const user = await authService.createUser(login, email, password)

    if (user) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  })

authRouter.post('/registration-confirmation',
  body('code').notEmpty().trim(),
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
      res.send(400)
    }
  })

authRouter.post('/registration-email-resending',
  body('email').notEmpty().trim().isEmail().matches(emailPattern),
  (req: RequestWithBody<{ email: string }>, res: Response) => {

  })
