import {RequestsModel} from "../../db/models";

export class RequestsRepository {
  async increaseRequestCount(newRequest: any) {
    return RequestsModel.create(newRequest)
  }
}

