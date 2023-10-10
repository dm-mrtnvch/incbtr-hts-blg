import {SecurityRepository} from "../repositories/security";

export class SecurityService {
  securityRepository: SecurityRepository
  constructor() {
    this.securityRepository = new SecurityRepository()
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

export const securityService = new SecurityService()
