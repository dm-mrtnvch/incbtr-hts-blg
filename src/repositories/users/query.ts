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
  }
}
