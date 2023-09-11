import {Router, Response, Request} from "express";
import {body} from "express-validator";
import {jwtService} from "../../application/jwt/jwt.service";
import {errorsValidation} from "../../helpers/utils";
import {RequestWithBody} from "../../interfaces";
import {usersService} from "../../services/users.service";

export const authRouter = Router()

authRouter.post('/login',
  body('loginOrEmail').notEmpty().trim().isLength({min: 1}),
  body('password').notEmpty().trim().isLength({min: 1}),
  // async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: Response) => {
  async (req: Request, res: Response) => {
    const {loginOrEmail, password} = req.body

    const errors = errorsValidation(req, res)
    if(errors?.errorsMessages?.length){
      res.status(400).send(errors)
      return
    }

    const userId = await usersService.checkCredentials(loginOrEmail, password)

    if(userId){
      const token = await jwtService.createJwt(userId)
      res.status(201).send(token)
    } else {
      res.sendStatus(401)
    }
  })
