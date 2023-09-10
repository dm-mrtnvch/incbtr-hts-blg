import {FindOptions} from "mongodb";
import {usersCollection} from "../../db/db";
import {IUser} from "../../interfaces";

export const usersRepository = {
  getAllUsers(filterOptions: any, findOptions: FindOptions) {
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

    return usersCollection.find(filter, findOptions).toArray()
  },
  /// may be add to usersQueryRepository
  findUserByLoginOrEmail(loginOrEmail: string) {
    return usersCollection.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
  },
  async createUser(newUser: any) {
    await usersCollection.insertOne({...newUser})
    return newUser
  },
  async deleteUserById(id: string) {
    const response = await usersCollection.deleteOne({id})
    return !!response.deletedCount
  }
}
