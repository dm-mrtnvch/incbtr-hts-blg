import bcrypt from "bcrypt";
import {tr} from "date-fns/locale";
import {emailAdapter} from "../adapters/emailAdapter";
import {IUserDb} from "../interfaces";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";
import {v4 as uuidv4} from "uuid";

class AuthService {
  async confirmEmail(code: string): Promise<boolean> {
    const user = await usersQueryRepository.findUserByConfirmationCode(code)

    if (!user || user.emailConfirmation.isConfirmed || new Date() > user.emailConfirmation.expirationDate) {
      return false
    }

    return await usersRepository.updateConfirmation(user.id)
  }
  async resendRegistrationConfirmEmail(email: string) {
    try {
      const user = await usersQueryRepository.findUserByEmail(email)

      if (user.emailConfirmation.isConfirmed) return false

      await usersRepository.updateConfirmationCode(user.id)
      const updatedUser = await usersQueryRepository.getUserById(user.id)

      if (!updatedUser) return false

      if (user.emailConfirmation.confirmationCode !== updatedUser.emailConfirmation.confirmationCode) {
        return await emailAdapter.sendEmailConfirmationMessage(email, updatedUser.emailConfirmation.confirmationCode)
      } else {
        return false
      }
    } catch (e) {
      console.log('emailAdapter.sendEmailConfirmationMessage error', e)
      return false
    }
  }
  async checkCredentials(loginOrEmail: string, password: string) {
    const user: IUserDb | null = await usersQueryRepository.findUserByLoginOrEmail(loginOrEmail)

    if (!user || !user.emailConfirmation.isConfirmed) return false

    const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)

    return passwordHash === user.accountData.passwordHash
      ? user.id
      : false
  }
  async recoveryUserPassword(email: string) {

  }
  async _generateHash(password: string, passwordSalt: string) {
    return await bcrypt.hash(password, passwordSalt)
  }
}

export const authService = new AuthService()
