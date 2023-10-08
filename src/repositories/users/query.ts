import {FilterQuery} from "mongoose";
import {UserModel} from "../../db/models";
import {IUserDb} from "../../interfaces";
import {SortDirection} from "mongodb";

export class UsersQueryRepository {
  /// typization
  async getAllUsers(
    // filterOptions: any, projection: any, findOptions: any
    sortBy: string = 'createdAt',
    sortDirection: SortDirection = 'desc',
    pageNumber: number = 1,
    pageSize: number = 10,
    searchLoginTerm: string | null = null,
    searchEmailTerm: string | null = null
  ) {


    /// refactor
    const conditions = []

    if (searchLoginTerm) {
      conditions.push({login: {$regex: searchLoginTerm, $options: 'i'}})
    }

    if (searchEmailTerm) {
      conditions.push({email: {$regex: searchEmailTerm, $options: 'i'}})
    }

    const filter = conditions.length
      ? {$or: conditions}
      : {}

    // const projection = {
    //   _id: 0,
    //   __v: 0,
    //   accountData: {
    //     password: 0,
    //     passwordHash: 0,
    //     passwordSalt: 0,
    //   },
    //
    // }

    const skipCount = (pageNumber - 1) * pageSize
    const totalCount = await this.getAllUsersCount(filter)
    const totalPagesCount = Math.ceil(totalCount / pageSize)

    // return
    const users = await UserModel
      .find(filter)
      // .select(projection)
      .sort({[sortBy]: sortDirection})
      .skip(skipCount)
      .limit(pageSize)
      .lean()

      return {
        pagesCount: totalPagesCount,
        page: pageNumber,
        pageSize,
        totalCount,
        items: users.map(u =>({
          id: u.id,
          login: u.accountData.login,
          email: u.accountData.email,
          createdAt: u.accountData.createdAt
        }))
      }

  }

  getAllUsersCount(filterOptions: FilterQuery<IUserDb>) {
    /// typization
    const conditions = []

    if (filterOptions.searchLoginTerm) {
      conditions.push({login: {$regex: filterOptions.searchLoginTerm, $options: 'i'}})
    }

    if (filterOptions.searchEmailTerm) {
      conditions.push({email: {$regex: filterOptions.searchEmailTerm, $options: 'i'}})
    }

    const filter = conditions.length
      ? {$or: conditions}
      : {}

    return UserModel.countDocuments(filter)
  }

  /// projection in params or hardcode
  async getUserById(id: string): Promise<any> {
    return UserModel.findOne({id}, {'accountData.password': 0, _id: 0, __v: 0}).lean()
    // return UserModel.findOne({id}, { 'accountData.password': 0, _id: 0, __v: 0 }).lean()
  }

  findUserByLogin(login: string, projection?: { _id: 0 }) {
    return UserModel.findOne({'accountData.login': login}, projection)
  }

  findUserByEmail(email: string, projection?: { _id: 0 }): any {
    return UserModel.findOne({'accountData.email': email}, projection).lean()
  }

  findUserByLoginOrEmail(loginOrEmail: string, projection?: { _id: 0 }): Promise<IUserDb | null> {
    return UserModel.findOne(
      {$or: [{'accountData.login': loginOrEmail}, {'accountData.email': loginOrEmail}]},
      projection) as Promise<IUserDb | null>
  }

  findUserByConfirmationCode(confirmationCode: string, projection?: { _id: 0 }): any {
    return UserModel.findOne({'emailConfirmation.confirmationCode': confirmationCode}, projection)
  }

  findUserByPasswordRecoveryCode(code: string) {
    return UserModel.findOne({'passwordRecovery.recoveryCode': code}).lean() as any
  }
}

export const usersQueryRepository = new UsersQueryRepository()
