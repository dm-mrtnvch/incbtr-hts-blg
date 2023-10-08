import {Response, Router} from "express";
import {body, query} from "express-validator";
import {SortDirection} from "mongodb";
import {sortDirectionValueOrUndefined, toNumberOrUndefined} from "../helpers/utils";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../interfaces";
import {BasicAuthMiddleware, RequestErrorsValidationMiddleware} from "../middlewares/middlewares";
import {usersQueryRepository} from "../repositories/users/query";
import {UsersService, usersService} from "../services/users.service";

export const usersRouter = Router()

class UsersController {
  usersService: UsersService

  constructor() {
    this.usersService = new UsersService()
  }

  async getUsers(req: RequestWithQuery<{
    sortBy?: string,
    sortDirection?: SortDirection,
    pageNumber?: number,
    pageSize?: number,
    searchLoginTerm?: string,
    searchEmailTerm?: string
  }>, res: Response) {
    const {sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm} = req.query

    const users = await usersQueryRepository.getAllUsers(sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm)
    res.send(users)
  }

  async createUser(req: RequestWithBody<{ login: string, password: string, email: string }>, res: Response) {
    const {login, password, email} = req.body

    const newUser = await this.usersService.createUserBySuperAdmin(login, password, email)
    res.status(201).send(newUser)
  }

  async deleteUser(req: RequestWithParams<{ id: string }>, res: Response) {
    const {id} = req.params

    const isUserDeleted = await this.usersService.deleteUserById(id)
    if (isUserDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  }
}

const usersController = new UsersController()

usersRouter.get('/',
  BasicAuthMiddleware,
  query('sortDirection').customSanitizer(sortDirectionValueOrUndefined),
  query('pageNumber').customSanitizer(toNumberOrUndefined),
  query('pageSize').customSanitizer(toNumberOrUndefined),
  usersController.getUsers
)

usersRouter.post('/',
  BasicAuthMiddleware,
  body('login').notEmpty().trim().isLength({min: 3, max: 10}),
  body('password').notEmpty().trim().isLength({min: 6, max: 20}),
  body('email').notEmpty().trim().isEmail().withMessage('email should matches ^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$\n pattern'),
  RequestErrorsValidationMiddleware,
  usersController.createUser.bind(usersController)
)

usersRouter.delete('/:id',
  BasicAuthMiddleware,
  usersController.deleteUser.bind(usersController)
)
