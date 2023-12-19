import bcrypt from "bcrypt";
import {randomUUID} from "crypto";
import add from "date-fns/add";
import {Request, Response} from "express";
import {inject, injectable} from "inversify";
import {v4 as uuidv4} from "uuid";
import {EmailAdapter} from "../adapters/emailAdapter";
import {JwtService} from "../application/jwt/jwt.service";
import {DeviceSessionModel, UserModel} from "../db/models";
import {RequestWithBody} from "../interfaces";
import {UsersRepository} from "../repositories/users";
import {UsersQueryRepository} from "../repositories/users/query";
import {AuthService} from "../services/auth.service";
import {SecurityService} from "../services/security.service";
import {UsersService} from "../services/users.service";

@injectable()
export class AuthController {
  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject(JwtService) private jwtService: JwtService,
    @inject(SecurityService) private securityService: SecurityService,
    @inject(UsersService) private usersService: UsersService,
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository,
    @inject(EmailAdapter) private emailAdapter: EmailAdapter) {
  }

  async login(req: RequestWithBody<{ loginOrEmail: string, password: string }>, res: Response) {
    const {loginOrEmail, password} = req.body

    const userId = await this.authService.checkCredentials(loginOrEmail, password)
    if (userId) {

      //TODO; remove uuid library
      const deviceId = randomUUID()
      const accessToken = await this.jwtService.createJwt(userId)
      const refreshToken = await this.jwtService.createRefreshToken(userId, deviceId)

      const newSession = {
        ip: req.ip,
        title: req.headers['user-agent'] || 'asdf',
        deviceId,
        userId,
        lastActiveDate: this.jwtService.getLastActiveDateFromToken(refreshToken)
      }

      await this.securityService.createDeviceSession(newSession)
      //lastActiveDate === refresh token issuance time

      res
        .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        .send(accessToken)

    } else {
      res.sendStatus(401)
    }
  }

  async logout(req: Request, res: Response) {
    // await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)
    const {userId, deviceId, iat} = req.jwtPayload
    const device = await DeviceSessionModel.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    await this.securityService.deleteSessionByUserIdAndDeviceId(userId, deviceId)
    return res.clearCookie('refreshToken').status(204).send()
  }

  async me(req: Request, res: Response) {
    const user = await this.usersQueryRepository.getUserById(req.userId)

    res.send({
      email: user.accountData.email,
      login: user.accountData.login,
      userId: user.id
    })

  }

  async registration(req: RequestWithBody<{ login: string, password: string, email: string }>, res: Response) {
    const {login, email, password} = req.body
    const user = await this.usersService.createUserByRegistration(login, password, email)

    if (user) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  }

  async registrationConfirmation(req: RequestWithBody<{ code: string }>, res: Response) {
    const {code} = req.body
    const isConfirmed = await this.authService.confirmEmail(code)

    if (isConfirmed) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  }

  async registrationEmailResending(req: RequestWithBody<{ email: string }>, res: Response) {
    const {email} = req.body
    const resendEmailResult: any = await this.authService.resendRegistrationConfirmEmail(email)

    if (resendEmailResult.messageId) {
      res.sendStatus(204)
    } else {
      res.sendStatus(400)
    }
  }

  async passwordRecovery(req: RequestWithBody<{ email: string }>, res: Response) {
    const {email} = req.body
    const user = await this.usersQueryRepository.findUserByEmail(email)

    if (!user) {
      res.sendStatus(204)
      return
    }

    const passwordRecoveryCode = uuidv4()
    const expirationDate = add(new Date(), {hours: 1})
    const result = await this.emailAdapter.recoverUserPassword(email, passwordRecoveryCode)

    if (result.messageId) {
      await this.usersRepository.updateUserRecoveryPasswordCode(user.id, passwordRecoveryCode, expirationDate)
    }
    res.sendStatus(204)
  }

  async newPassword(req: RequestWithBody<{ newPassword: string, recoveryCode: string }>, res: Response) {
    const {newPassword, recoveryCode} = req.body
    const user = await this.usersQueryRepository.findUserByPasswordRecoveryCode(recoveryCode)
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this.authService._generateHash(newPassword, passwordSalt)

    await UserModel
      .updateOne({id: user?.id}, {
        $set: {
          'accountData.passwordSalt': passwordSalt,
          'accountData.passwordHash': passwordHash
        }
      })

    res.sendStatus(204)
  }

  async refreshToken(req: Request, res: Response) {
    const {userId, deviceId, iat} = req.jwtPayload
    const device = await DeviceSessionModel.findOne({deviceId, userId})
    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    const newAccessToken = await this.jwtService.createJwt(userId)
    const newRefreshToken = await this.jwtService.createRefreshToken(userId, deviceId)

    if (newAccessToken && newRefreshToken) {
      // await jwtService.addRefreshTokenToBlacklist(req.cookies.refreshToken)
      const lastActiveDate = this.jwtService.getLastActiveDateFromToken(newRefreshToken)
      await this.securityService.updateDeviceSessionLastActiveDate(userId, deviceId, lastActiveDate)

      res.cookie('refreshToken', newRefreshToken, {httpOnly: true, secure: true})
      res.send(newAccessToken)
      return
    } else {
      return res.sendStatus(401)
    }
  }
}
