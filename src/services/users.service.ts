import {FindOptions, SortDirection, UUID} from "mongodb";
import {usersCollection} from "../db/db";
import {IUser} from "../interfaces";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";
import {v4 as uuidv4} from "uuid";

export const usersService = {
  async getAllUsers(
    sortBy: string = 'createdAt',
    sortDirection: SortDirection = 'desc',
    pageNumber: number = 1,
    pageSize: number = 10,
    searchLoginTerm: string | null = null,
    searchEmailTerm: string | null = null
  ) {

    const filterOptions = {
      ...(searchLoginTerm && {login: new RegExp(searchLoginTerm, 'i')}),
      ...(searchEmailTerm && {email: new RegExp(searchEmailTerm, 'i')})
    }

    const skipCount = (pageNumber - 1) * pageSize
    const totalCount = await usersQueryRepository.getAllUsersCount(filterOptions)
    const totalPagesCount = Math.ceil(totalCount / pageSize)

    const usersFindOptions: FindOptions = {
      projection: {_id: 0},
      skip: skipCount,
      limit: pageSize,
      sort: {[sortBy]: sortDirection}
    }

    const users = await usersRepository.getAllUsers(filterOptions, usersFindOptions)
    console.log('users', users)
    return {
      pagesCount: totalPagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users
    }
  },
  createUser(login: string, password: string, email: string) {
    const newUser: IUser = {
      id: uuidv4(),
      login,
      password,
      email,
      createdAt: new Date().toISOString()
    }

    return usersRepository.createUser(newUser)
  },
  async deleteUserById(id: string) {
    return usersRepository.deleteUserById(id)
  }
}
