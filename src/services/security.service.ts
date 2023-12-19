import {inject, injectable} from "inversify";
import {SecurityRepository} from "../repositories/security";

@injectable()
export class SecurityService {
  constructor(
    @inject(SecurityRepository) private securityRepository: SecurityRepository
  ) {
  }

  async createDeviceSession(newSession: any) {
    return this.securityRepository.createDeviceSession(newSession)
  }

  async updateDeviceSessionLastActiveDate(userId: string, deviceId: string, lastActiveDate: string) {
    const result = await this.securityRepository.updateDeviceSessionLastActiveDate(userId, deviceId, lastActiveDate)
    return !!result.modifiedCount
  }

  async deleteDeviceSessionsExceptCurrent(userId: string, deviceId: string) {
    return this.securityRepository.deleteDeviceSessionsExceptCurrent(userId, deviceId)
  }

  async deleteSessionByDeviceId(deviceId: string) {
    const result = await this.securityRepository.deleteSessionByDeviceId(deviceId)
    return !!result.deletedCount
  }

  async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string) {
    const result = await this.securityRepository.deleteSessionByUserIdAndDeviceId(userId, deviceId)
    return !!result.deletedCount
  }
}
