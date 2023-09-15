import {Filter} from "mongodb";
import {usersCollection} from "../../db/db";
import {IUser} from "../../interfaces";

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

    return usersCollection.countDocuments(filter)
  },
  getUserById(id: string) {
    return usersCollection.findOne({id}, {projection: {password: 0}})
  },
  findUserByLogin(login: string, email?: string) {
    return usersCollection.findOne({'accountData.login': login}, {projection: {_id: 0}})
  },
  findUserByEmail(email: string) {
    return usersCollection.findOne({'accountData.email': email}, {projection: {_id: 0}})
  },
}
