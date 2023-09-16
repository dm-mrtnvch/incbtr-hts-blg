import {FindOptions} from "mongodb";
import {usersCollection} from "../../db/db";
import {IUser} from "../../interfaces";
import {v4 as uuidv4} from "uuid";

export const usersRepository = {
  getAllUsers(filterOptions: any, findOptions: FindOptions) {

    // refactor
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
  findUserByConfirmationCode(confirmationCode: string): any {
    return usersCollection.findOne({'emailConfirmation.confirmationCode': confirmationCode}, {projection: {_id: 0}})
  },
  async createUser(newUser: any) {
    await usersCollection.insertOne({...newUser})
    return newUser
  },
  async updateConfirmation(id: string) {
    const result = await usersCollection.updateOne({id}, {
      $set: {'emailConfirmation.isConfirmed': true}
    })

    return !!result.modifiedCount
  },
  async updateConfirmationCode(id: string) {
    const newConfirmationCode = uuidv4()

    const result = await usersCollection.updateOne({id}, {
      $set: {'emailConfirmation.confirmationCode': newConfirmationCode}
    })

    return result
  },

  async deleteUserById(id: string) {
    const response = await usersCollection.deleteOne({id})
    return !!response.deletedCount
  }
}
