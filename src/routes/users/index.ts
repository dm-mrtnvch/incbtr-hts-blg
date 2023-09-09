import {Response, Request, Router} from "express";
import {body, query} from "express-validator";
import {SortDirection} from "mongodb";
import {errorsValidation, sortDirectionValueOrUndefined, toNumberOrUndefined} from "../../helpers/utils";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../interfaces";
import {BasicAuthMiddleware} from "../../middlewares/middlewares";
import {blogsService} from "../../services/blogs.service";
import {usersService} from "../../services/users.service";

export const usersRouter = Router()

usersRouter.get('/',
  BasicAuthMiddleware,
  query('sortDirection').customSanitizer(sortDirectionValueOrUndefined),
  query('pageNumber').customSanitizer(toNumberOrUndefined),
  query('pageSize').customSanitizer(toNumberOrUndefined),
  async (req: RequestWithQuery<{
    sortBy?: string,
    sortDirection?: SortDirection,
    pageNumber?: number,
    pageSize?: number,
    searchLoginTerm?: string,
    searchEmailTerm?: string
  }>, res: Response) => {

    const {sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm} = req.query

    const users = await usersService.getAllUsers(sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm)

    res.send(users)
  })

usersRouter.post('/',
  BasicAuthMiddleware,
  body('login').notEmpty().trim().isLength({min: 3, max: 10}),
  body('password').notEmpty().trim().isLength({min: 6, max: 20}),
  body('email').notEmpty().trim().isEmail().withMessage('email should matches ^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$\n pattern'),
  async (req: RequestWithBody<{ login: string, password: string, email: string }>, res: Response) => {
    const {login, password, email} = req.body

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const newUser = await usersService.createUser(login, password, email)
    res.status(201).send(newUser)
  })

usersRouter.delete('/:id',
  BasicAuthMiddleware,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const {id} = req.params

    const isUserDeleted = await usersService.deleteUserById(id)
    if (isUserDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
