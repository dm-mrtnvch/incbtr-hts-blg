import bcrypt from "bcrypt";
import {ca} from "date-fns/locale";
import {emailAdapter} from "../adapters/emailAdapter";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";


export const authService = {
  async confirmEmail(code: string) {
    const user = await usersRepository.findUserByConfirmationCode(code)

    if (!user) return false
    if (user.emailConfirmation.isConfirmed) {
      return false
    }
    if (user.emailConfirmation.confirmationCode !== code) {
      return false
    }
    if (new Date() > user.emailConfirmation.expirationDate) {
      return false
    }
    return await usersRepository.updateConfirmation(user.id)
  },
  async resendRegistrationConfirmEmail(email: string) {
    try {
      const user = await usersQueryRepository.findUserByEmail(email)

      if (user.emailConfirmation.isConfirmed) {
        return false
      }
// code string || null
      //
      await usersRepository.updateConfirmationCode(user.id)
      const updatedUser = await usersQueryRepository.getUserById(user.id)

      if (!updatedUser) {
        return false
      }

      if (user.emailConfirmation.confirmationCode !== updatedUser.emailConfirmation.confirmationCode) {
        return await emailAdapter.sendEmailConfirmationMessage(email, updatedUser.emailConfirmation.confirmationCode)
      } else {
        return false
      }

    } catch (e) {
      console.log(e)
      return false
    }


  },
  async checkCredentials(loginOrEmail: string, password: string) {
    const user: any = await usersQueryRepository.findUserByLoginOrEmail(loginOrEmail)

    if (!user) {
      return false
    }

    if (!user.emailConfirmation.isConfirmed) {
      return false
    }

    const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)

    if (passwordHash === user.accountData.passwordHash) {
      return user.id
    } else {
      return false
    }
  },
  async _generateHash(password: string, passwordSalt: string) {
    return await bcrypt.hash(password, passwordSalt)
  }
}
