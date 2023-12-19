import {Router} from "express";
import {body, query} from "express-validator";
import {UsersController} from "../controllers/users.controller";
import {sortDirectionValueOrUndefined, toNumberOrUndefined} from "../helpers/utils";
import {container} from "../inversify/inversify.config";
import {BasicAuthMiddleware, RequestErrorsValidationMiddleware} from "../middlewares/middlewares";

const usersController = container.resolve(UsersController)
export const usersRouter = Router()

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




