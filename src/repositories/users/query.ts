import {Filter} from "mongodb";
import {UserModel} from "../../db/db";
import {IUser, IUserDb} from "../../interfaces";

export const usersQueryRepository = {
  getAllUsersCount(filterOptions: any) {
    const conditions: Filter<IUser> = []

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
  getUserById(id: string): any {
    return UserModel.findOne({id}, {projection: {password: 0, _id: 0}})
  },
  findUserByLogin(login: string, email?: string) {
    return UserModel.findOne({'accountData.login': login}, {projection: {_id: 0}})
  },
  findUserByEmail(email: string): any {
    return UserModel.findOne({'accountData.email': email}, {projection: {_id: 0}})
  },
  findUserByLoginOrEmail(loginOrEmail: string): Promise<IUserDb| null> {
    return UserModel.findOne(
      {$or: [{'accountData.login': loginOrEmail}, {'accountData.email': loginOrEmail}]},
      {projection: {_id: 0}}) as Promise<IUserDb| null>
  },
}
