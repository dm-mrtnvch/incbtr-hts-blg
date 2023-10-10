import {Request, Response, Router} from "express";
import {DeviceSessionModel} from "../db/models";
import {RefreshTokenAuthMiddleware} from "../middlewares/middlewares";
import {SecurityQueryRepository} from "../repositories/security/query";
import {SecurityService} from "../services/security.service";

export const securityRouter = Router()

class SecurityController {
  securityQueryRepository: SecurityQueryRepository
  securityService: SecurityService

  constructor() {
    this.securityQueryRepository = new SecurityQueryRepository()
    this.securityService = new SecurityService()
  }

  async getDevices(req: Request, res: Response) {
    const {userId} = req.jwtPayload
    const activeSessions = await this.securityQueryRepository.getActiveSessionsByUserId(userId)
    res.send(activeSessions)
  }

  async deleteDevices(req: Request, res: Response) {
    const {deviceId, userId, iat} = req.jwtPayload
    const device = await this.securityQueryRepository.getDeviceSessionByUserIdAndDeviceId(userId, deviceId)

    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    await this.securityService.deleteDeviceSessionsExceptCurrent(userId, deviceId)
    return res.sendStatus(204)
  }

  async deleteDevice(req: Request, res: Response) {
    const {deviceId} = req.params
    const {userId, iat} = req.jwtPayload

    const device = await DeviceSessionModel.findOne({deviceId})
    if (!device) return res.sendStatus(404)
    if (device.userId !== userId) return res.sendStatus(403)
    // if(device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    const isDeleted = await this.securityService.deleteSessionByDeviceId(deviceId)

    if (isDeleted) {
      return res.sendStatus(204)
    } else {
      return res.sendStatus(404)
    }
  }
}

const securityController = new SecurityController()

securityRouter.get('/devices',
  RefreshTokenAuthMiddleware,
  securityController.getDevices.bind(securityController)
)

securityRouter.delete('/devices',
  RefreshTokenAuthMiddleware,
  securityController.deleteDevices.bind(securityController)
)

securityRouter.delete('/devices/:deviceId',
  RefreshTokenAuthMiddleware,
  securityController.deleteDevice.bind(securityController)
)
