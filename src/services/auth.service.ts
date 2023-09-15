import bcrypt from "bcrypt";
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add'
import {emailAdapter} from "../adapters/emailAdapter";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";
import {usersService} from "./users.service";


export const authService = {
  async createUser(login: string, email: string, password: string) {
    console.log('sss', login, email, password)
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(password, passwordSalt)


    const newUser = {
      id: uuidv4(),
      accountData: {
        login,
        email,
        passwordHash,
        passwordSalt,
        createdAt: new Date().toISOString()
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), {
          days: 30
        }),
        isConfirmed: false
      }
    }

    const createdUser = await usersRepository.createUser(newUser)

    try {
      await emailAdapter.sendEmailConfirmationMessage(email)
    } catch (error) {
      await usersRepository.deleteUserById(createdUser.id)
      return null
    }

    return createdUser
  },
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
    const user = await usersQueryRepository.findUserByEmail(email)

    if(user.emailConfirmation.isConfirmed) { return false}

    if (user) {
      return  await emailAdapter.sendEmailConfirmationMessage(email)
    } else {
      return false
    }

  },
  async _generateHash(password: string, passwordSalt: string) {
    return await bcrypt.hash(password, passwordSalt)
  }
}
