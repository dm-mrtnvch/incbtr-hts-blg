import {FindOptions} from "mongodb";
import {usersCollection} from "../../db/db";
import {IUser} from "../../interfaces";

export const usersRepository = {
  getAllUsers(filterOptions: any, findOptions: FindOptions) {
    console.log(filterOptions, findOptions)
    return usersCollection.find(filterOptions, findOptions).toArray()
  },
  async createUser(newUser: IUser) {
    await usersCollection.insertOne({...newUser})
    return newUser
  },
  async deleteUserById(id: string) {
    const response = await usersCollection.deleteOne({id})
    return !!response.deletedCount
  }
}
