import bcrypt from "bcrypt";
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add'
import {emailAdapter} from "../adapters/emailAdapter";
import {usersRepository} from "../repositories/users";
import {usersService} from "./users.service";


export const authService = {
  async createUser(login: string, email: string, password: string) {

    const passwordSalt = await bcrypt.genSalt(10)
    // const passwordHash = this._generateHash(password, passwordSalt)


    const newUser = {
      id: uuidv4(),
      accountData: {
        login,
        email,
        passwordHash: 1,
        passwordSalt,
        createdAt: new Date().toISOString()
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        exprationDate: add(new Date(), {
          days: 30
        }),
        isConfirmed: false
      }
    }

    const createdUser = await usersRepository.createUser(newUser)

    try {
      await emailAdapter.sendEmailConfirmationMessage(email)
    } catch (error) {
      console.log('sendEmailConfirmationMessage error', error)
      await usersRepository.deleteUserById(createdUser.id)
      return null
    }

    return createdUser
  },
  async _generateHash(password: string, passwordSalt: string) {
    return await bcrypt.hash(password, passwordSalt)
  }
}
