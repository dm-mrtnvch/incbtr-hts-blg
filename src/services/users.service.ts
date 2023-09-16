import add from "date-fns/add";
import {Filter, FindOptions, SortDirection, UUID} from "mongodb";
import {emailAdapter} from "../adapters/emailAdapter";
import {usersCollection} from "../db/db";
import {EmailConfirmationType, IUser, IUserDb, IUserView} from "../interfaces";
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

    // const conditions = []
    //
    // if(searchLoginTerm) {
    //   conditions.push({login: new RegExp(searchLoginTerm, 'i')})
    // }
    //
    // if(searchEmailTerm) {
    //   conditions.push({email: new RegExp(searchEmailTerm, 'i')})
    // }
    //
    // const filterOptions = conditions.length ? {$or: conditions} : {}


    // const filterOptions: any = {
    //   $or: [
    //     {login: {$regex: searchLoginTerm ?? '', $options: 'i'}},
    //     {email: {$regex: searchEmailTerm ?? '', $options: 'i'}},
    //   ]
    // }

    const filterOptions = {
      searchLoginTerm,
      searchEmailTerm
    }

    const skipCount = (pageNumber - 1) * pageSize
    const totalCount = await usersQueryRepository.getAllUsersCount(filterOptions)
    const totalPagesCount = Math.ceil(totalCount / pageSize)

    const usersFindOptions: FindOptions = {
      projection: {_id: 0, password: 0, passwordHash: 0, passwordSalt: 0},
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize,
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
  async createUserBySuperAdmin(login: string, password: string, email: string) {
    const emailConfirmation: EmailConfirmationType = {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: true
    }
    const user = await this._createUser(login, password, email, emailConfirmation)
    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt
    }
  },

  async createUserByRegistration(login: string, password: string, email: string) {
    const emailConfirmation: EmailConfirmationType = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {days: 30}),
      isConfirmed: false
    }
    return this._createUser(login, password, email, emailConfirmation)
  },

  async deleteUserById(id: string) {
    return usersRepository.deleteUserById(id)
  },
  async checkCredentials(loginOrEmail: string, password: string) {
    const user: any = await usersRepository.findUserByLoginOrEmail(loginOrEmail)

    if (!user) {
      return false
    }

    if (!user.emailConfirmation.isConfirmed) {
      return false
    }
    const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)

    if (passwordHash === user.passwordHash) {
      return user.id
    } else {
      return false
    }
  },
  async _generateHash(password: string, passwordSalt: string) {
    return await bcrypt.hash(password, passwordSalt)
  },
  async _createUser(login: string, password: string, email: string, emailConfirmation: EmailConfirmationType) {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(password, passwordSalt)

    const newUser: IUserDb = {
      id: uuidv4(),
      accountData: {
        login,
        email,
        passwordHash,
        passwordSalt,
        createdAt: new Date().toISOString()
      },
      emailConfirmation
    }

    const createdUser = await usersRepository.createUser(newUser)

    if (createdUser.emailConfirmation.confirmationCode) {
      try {
        await emailAdapter.sendEmailConfirmationMessage(email, createdUser.emailConfirmation.confirmationCode)
      } catch (error) {
        console.log(error)
        await usersRepository.deleteUserById(createdUser.id)
        return null
      }
    }
    return createdUser
  },
}
