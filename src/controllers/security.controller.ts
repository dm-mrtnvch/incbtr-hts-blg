import {Request, Response} from "express";
import {inject, injectable} from "inversify";
import {DeviceSessionModel} from "../db/models";
import {SecurityQueryRepository} from "../repositories/security/query";
import {SecurityService} from "../services/security.service";

@injectable()
export class SecurityController {
  constructor(
    @inject(SecurityService) private securityService: SecurityService,
    @inject(SecurityQueryRepository) private securityQueryRepository: SecurityQueryRepository
  ) {
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
