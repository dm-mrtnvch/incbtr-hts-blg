import bcrypt from "bcrypt";
import {EmailAdapter} from "../adapters/emailAdapter";
import {IUserDb} from "../interfaces";
import {UsersRepository} from "../repositories/users";
import {UsersQueryRepository} from "../repositories/users/query";

export class AuthService {
  constructor(
    protected emailAdapter: EmailAdapter,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository
  ) {

  }
  async confirmEmail(code: string): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserByConfirmationCode(code)

    if (!user || user.emailConfirmation.isConfirmed || new Date() > user.emailConfirmation.expirationDate) {
      return false
    }

    return await this.usersRepository.updateConfirmation(user.id)
  }

  async resendRegistrationConfirmEmail(email: string) {
    try {
      const user = await this.usersQueryRepository.findUserByEmail(email)

      if (user.emailConfirmation.isConfirmed) return false

      await this.usersRepository.updateConfirmationCode(user.id)
      const updatedUser = await this.usersQueryRepository.getUserById(user.id)

      if (!updatedUser) return false

      if (user.emailConfirmation.confirmationCode !== updatedUser.emailConfirmation.confirmationCode) {
        return await this.emailAdapter.sendEmailConfirmationMessage(email, updatedUser.emailConfirmation.confirmationCode)
      } else {
        return false
      }
    } catch (e) {
      console.log('emailAdapter.sendEmailConfirmationMessage error', e)
      return false
    }
  }

  async checkCredentials(loginOrEmail: string, password: string) {
    const user: IUserDb | null = await this.usersQueryRepository.findUserByLoginOrEmail(loginOrEmail)

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

