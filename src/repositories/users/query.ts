import {Filter, FindOptions} from "mongodb";
import {UserModel} from "../../db/db";
import {IUser, IUserDb} from "../../interfaces";

export const usersQueryRepository = {
  /// typization
  getAllUsers(filterOptions: any, projection: any, findOptions: any) {
    const {sort, skip, limit} = findOptions

    /// refactor
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

    return UserModel
      .find(filter)
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  },
  getAllUsersCount(filterOptions: any) {
    /// typization
    const conditions: any= []

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
  },
  /// projection in params or hardcode
  getUserById(id: string, projection?: {password: 0, _id: 0}): any {
    return UserModel.findOne({id}, projection)
  },
  findUserByLogin(login: string, projection?: {_id: 0}) {
    return UserModel.findOne({'accountData.login': login}, projection)
  },
  findUserByEmail(email: string, projection?: {_id: 0}): any {
    return UserModel.findOne({'accountData.email': email}, projection)
  },
  findUserByLoginOrEmail(loginOrEmail: string, projection?: {_id: 0}): Promise<IUserDb| null> {
    return UserModel.findOne(
      {$or: [{'accountData.login': loginOrEmail}, {'accountData.email': loginOrEmail}]},
      projection) as Promise<IUserDb| null>
  },
  findUserByConfirmationCode(confirmationCode: string, projection?: {_id: 0}): any {
    return UserModel.findOne({'emailConfirmation.confirmationCode': confirmationCode}, projection)
  },
}
