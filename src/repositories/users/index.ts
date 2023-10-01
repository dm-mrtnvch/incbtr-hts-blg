import {v4 as uuidv4} from "uuid";

import {UserModel} from "../../db/models";

class UsersRepository {
  /// tipization
  async createUser(newUser: any): Promise<any> {
    const createdUser = await UserModel.create(newUser) as any
    const {id, login, email, createdAt} = createdUser

    return {
      id,
      login,
      email,
      createdAt
    }
  }
  async updateConfirmation(id: string): Promise<boolean> {
    const result = await UserModel.updateOne({id}, {
      $set: {'emailConfirmation.isConfirmed': true}
    })

    return !!result.modifiedCount
  }
  async updateConfirmationCode(id: string) {
    const newConfirmationCode = uuidv4()
    /// await for tests?
    return UserModel.updateOne({id}, {
      $set: {'emailConfirmation.confirmationCode': newConfirmationCode}
    })
  }
  async updateUserRecoveryPasswordCode(id: string, recoveryCode: string, expirationDate: any){

    return UserModel.updateOne({id}, {
      $set: {
        'passwordRecovery.recoveryCode': recoveryCode,
        'passwordRecovery.expirationDate': expirationDate,
      },
    })
  }
  async deleteUserById(id: string) {
    const response = await UserModel.deleteOne({id})
    return !!response.deletedCount
  }
}

export const usersRepository = new UsersRepository()
