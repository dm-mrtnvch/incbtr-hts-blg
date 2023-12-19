import {Response} from "express";
import {inject, injectable} from "inversify";
import {SortDirection} from "mongodb";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../interfaces";
import {UsersQueryRepository} from "../repositories/users/query";
import {UsersService} from "../services/users.service";

@injectable()
export class UsersController {
  constructor(
    @inject(UsersService) private usersService: UsersService,
    @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository
  ) {}

  async getUsers(req: RequestWithQuery<{
    sortBy?: string,
    sortDirection?: SortDirection,
    pageNumber?: number,
    pageSize?: number,
    searchLoginTerm?: string,
    searchEmailTerm?: string
  }>, res: Response) {
    const {sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm} = req.query

    const users = await this.usersQueryRepository.getAllUsers(sortBy, sortDirection, pageNumber, pageSize, searchLoginTerm, searchEmailTerm)
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
