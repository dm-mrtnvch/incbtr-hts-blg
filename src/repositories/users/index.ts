import {FindOptions} from "mongodb";
import {usersCollection} from "../../db/db";
import {IUser} from "../../interfaces";

export const usersRepository = {
  getAllUsers(filterOptions: any, findOptions: FindOptions) {
    const {login, email}: any = filterOptions

    console.log(login, email)
    return usersCollection.find({$or: [{login}, {email}]}, findOptions).toArray()
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
