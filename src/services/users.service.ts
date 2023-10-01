import bcrypt from "bcrypt"
import add from "date-fns/add";
import e from "express";
import {FindOptions, SortDirection} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {emailAdapter} from "../adapters/emailAdapter";
import {EmailConfirmationType} from "../interfaces";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";

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

    const projection = {
      _id: 0,
      __v: 0,
      password: 0,
      passwordHash: 0,
      passwordSalt: 0,
    }

    const findOptions: FindOptions = {
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize,
    }
    const users = await usersQueryRepository.getAllUsers(filterOptions, projection, findOptions)

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

  async updatePasswordRecoveryCode(email: string, recoveryCode: string) {
    const expirationDate = add(new Date(), {hours: 1})
    const user = usersQueryRepository.findUserByEmail(email)

    if (user) {
      const result = await usersRepository.updateUserRecoveryPasswordCode(user.id, recoveryCode, expirationDate)
      return !!result.modifiedCount
    } else {
      return false
    }
  },

  async deleteUserById(id: string) {
    return usersRepository.deleteUserById(id)
  },
  // async checkCredentials(loginOrEmail: string, password: string) {
  //   const user: any = await usersQueryRepository.findUserByLoginOrEmail(loginOrEmail)
  //
  //   if (!user) {
  //     return false
  //   }
  //
  //   if (!user.emailConfirmation.isConfirmed) {
  //     return false
  //   }
  //   const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
  //
  //   if (passwordHash === user.passwordHash) {
  //     return user.id
  //   } else {
  //     return false
  //   }
  // },
  async _generateHash(password: string, passwordSalt: string) {
    return await bcrypt.hash(password, passwordSalt)
  },
  async _createUser(login: string, password: string, email: string, emailConfirmation: EmailConfirmationType) {
    try {
      const passwordSalt = await bcrypt.genSalt(10)
      const passwordHash = await this._generateHash(password, passwordSalt)

      const newUser: any = {
        id: uuidv4(),
        accountData: {
          login,
          email,
          passwordHash,
          passwordSalt,
          createdAt: new Date().toISOString()
        },
        emailConfirmation,
        passwordRecovery: {
          recoveryCode: null,
          expirationDate: null
        }
      }

      await usersRepository.createUser(newUser)

      if (newUser.emailConfirmation.confirmationCode) {
        try {
          await emailAdapter.sendEmailConfirmationMessage(email, newUser.emailConfirmation.confirmationCode)
        } catch (error) {
          console.log(error)
          await usersRepository.deleteUserById(newUser.id)
          return null
        }
      }
      return newUser
    } catch (e) {
      console.log(e)
      return false
    }
  },
}
