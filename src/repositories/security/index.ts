import {injectable} from "inversify";
import {DeviceSessionModel} from "../../db/models";

@injectable()
export class SecurityRepository {
  createDeviceSession(newSession: any) {
    return DeviceSessionModel.create(newSession)
  }

  updateDeviceSessionLastActiveDate(userId: string, deviceId: string, lastActiveDate: string) {
    return DeviceSessionModel.updateOne({userId, deviceId}, {$set: {lastActiveDate}})
  }

  async deleteDeviceSessionsExceptCurrent(userId: string, deviceId: string) {
    return DeviceSessionModel.deleteMany({userId, deviceId: {$ne: deviceId}})
  }

  async deleteSessionByDeviceId(deviceId: string) {
    return DeviceSessionModel.deleteOne({deviceId})
  }

  async deleteSessionByUserIdAndDeviceId(userId: string, deviceId: string) {
    return DeviceSessionModel.deleteOne({userId, deviceId})
  }
}
