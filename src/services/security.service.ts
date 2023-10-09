import {securityRepository} from "../repositories/security";

export class SecurityService {
  async createDeviceSession(newSession: any) {
    return securityRepository.createDeviceSession(newSession)
  }
  async updateDeviceSessionLastActiveDate(userId: string, deviceId: string, lastActiveDate: string) {
    const result = await securityRepository.updateDeviceSessionLastActiveDate(userId, deviceId, lastActiveDate)
    return !!result.modifiedCount
  }
  async deleteDeviceSessionsExceptCurrent(userId: string, deviceId: string) {
    return securityRepository.deleteDeviceSessionsExceptCurrent(userId, deviceId)
  }
  async deleteSessionByDeviceId(deviceId: string) {
    const result = await securityRepository.deleteSessionByDeviceId(deviceId)
    return !!result.deletedCount
  }
  async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string) {
    const result = await securityRepository.deleteSessionByUserIdAndDeviceId(userId, deviceId)
    return !!result.deletedCount
  }
}

export const securityService = new SecurityService()
