import {FindOptions, SortDirection, UUID} from "mongodb";
import {usersCollection} from "../db/db";
import {IUser} from "../interfaces";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";
import {v4 as uuidv4} from "uuid";
import bcrypt from "bcrypt"

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
      projection: {_id: 0, password: 0, passwordHash: 0, passwordSalt: 0},
      skip: skipCount,
      limit: pageSize,
      sort: {[sortBy]: sortDirection}
    }
    const users = await usersRepository.getAllUsers(filterOptions, usersFindOptions)

    return {
      pagesCount: totalPagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users
    }
  },
  async createUser(login: string, password: string, email: string) {

    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(password, passwordSalt)

    const newUser = {
      id: uuidv4(),
      login,
      passwordHash,
      passwordSalt,
      email,
      createdAt: new Date().toISOString()
    }

    const response: any = await usersRepository.createUser(newUser)
    return {
      id: response.id,
      login,
      email,
      createdAt: response.createdAt
    }
  },
  async deleteUserById(id: string) {
    return usersRepository.deleteUserById(id)
  },
  async checkCredentials(loginOrEmail: string, password: string) {

    const user: any = await usersRepository.findUserByLoginOrEmail(loginOrEmail)
    if(!user){
      return false
    }
    const passwordHash = await this._generateHash(password, user.passwordSalt)

    return passwordHash === user.passwordHash
  },
  async _generateHash(password: string, passwordSalt: string) {
   return await bcrypt.hash(password, passwordSalt)
  }
}
