import {DeviceSessionModel} from "../../db/models";

export class SecurityQueryRepository {
  /// what about projection
  getActiveSessionsByUserId(userId: string): any {
    return DeviceSessionModel
      .find({userId})
      .select({_id: 0, userId: 0})
      .lean()
  }

  getDeviceSessionByUserIdAndDeviceId(userId: string, deviceId: string) {
    return DeviceSessionModel
      /// find / findOne
      .findOne({userId, deviceId})
      .lean()
  }
}
