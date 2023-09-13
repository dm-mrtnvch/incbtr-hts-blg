import {Router, Response, Request} from "express";
import {body} from "express-validator";
import {jwtService} from "../../application/jwt/jwt.service";
import {errorsValidation} from "../../helpers/utils";
import {RequestWithBody} from "../../interfaces";
import {TokenAuthMiddleware} from "../../middlewares/middlewares";
import {emailAdapter} from "../../adapters/emailAdapter";
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
  (req: Request, res: Response) => {


  })

authRouter.post('/registration',
  async (req: RequestWithBody<{ login: string, password: string, email: string }>, res: Response) => {

    const {login, password, email} = req.body

    const test = await emailAdapter.sendEmail()

  })
