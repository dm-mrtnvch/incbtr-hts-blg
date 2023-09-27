import {v4 as uuidv4} from "uuid";
import {UserModel} from "../../db/db";

export const usersRepository = {
  /// tipization
  async createUser(newUser: any): Promise<any> {
    const createdUser = await UserModel.create(newUser)
    const {id, login, email, createdAt} = createdUser

    return {
      id,
      login,
      email,
      createdAt
    }
  },
  async updateConfirmation(id: string): Promise<boolean> {
    const result = await UserModel.updateOne({id}, {
      $set: {'emailConfirmation.isConfirmed': true}
    })

    return !!result.modifiedCount
  },
  async updateConfirmationCode(id: string) {
    const newConfirmationCode = uuidv4()
    /// await for tests?
    return UserModel.updateOne({id}, {
      $set: {'emailConfirmation.confirmationCode': newConfirmationCode}
    })
  },
  async deleteUserById(id: string) {
    const response = await UserModel.deleteOne({id})
    return !!response.deletedCount
  }
}
