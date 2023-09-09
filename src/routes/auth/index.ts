import {Router, Response} from "express";
import {body} from "express-validator";
import {errorsValidation} from "../../helpers/utils";
import {RequestWithBody} from "../../interfaces";
import {usersService} from "../../services/users.service";

export const authRouter = Router()

authRouter.post('/login',
  body('loginOrEmail').notEmpty().trim().isLength({min: 1}),
  body('password').notEmpty().trim().isLength({min: 1}),
  async (req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: Response) => {
    const {loginOrEmail, password} = req.body

    const errors = errorsValidation(req, res)
    if(errors?.errorsMessages?.length){
      res.status(400).send(errors)
      return
    }

    const isVerified = await usersService.checkCredentials(loginOrEmail, password)

    return isVerified
      ? res.sendStatus(204)
      : res.sendStatus(401)
  })
