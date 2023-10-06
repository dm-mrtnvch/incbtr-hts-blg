import {Request, Response, Router} from "express";
import {DeviceSessionModel} from "../db/models";
import {RefreshTokenAuthMiddleware} from "../middlewares/middlewares";
import {securityQueryRepository} from "../repositories/security/query";
import {securityService} from "../services/security.service";

export const securityRouter = Router()

class SecurityController {
  async getDevices(req: Request, res: Response) {
    const {userId} = req.jwtPayload
    const activeSessions = await securityQueryRepository.getActiveSessionsByUserId(userId)
    res.send(activeSessions)
  }

  async deleteDevices(req: Request, res: Response) {
    const {deviceId, userId, iat} = req.jwtPayload
    const device = await securityQueryRepository.getDeviceSessionByUserIdAndDeviceId(userId, deviceId)

    if (!device) return res.sendStatus(401)
    if (device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    await securityService.deleteDeviceSessionsExceptCurrent(userId, deviceId)
    return res.sendStatus(204)
  }

  async deleteDevice(req: Request, res: Response) {
    const {deviceId} = req.params
    const {userId, iat} = req.jwtPayload

    const device = await DeviceSessionModel.findOne({deviceId})
    if (!device) return res.sendStatus(404)
    if (device.userId !== userId) return res.sendStatus(403)
    // if(device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    const isDeleted = await securityService.deleteSessionByDeviceId(deviceId)

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
  securityController.getDevices
)

securityRouter.delete('/devices',
  RefreshTokenAuthMiddleware,
  securityController.deleteDevices
)

securityRouter.delete('/devices/:deviceId',
  RefreshTokenAuthMiddleware,
  securityController.deleteDevice
)
