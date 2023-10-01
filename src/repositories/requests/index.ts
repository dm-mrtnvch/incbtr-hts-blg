import {RequestsModel} from "../../db/models";

class RequestsRepository {
  async increaseRequestCount(newRequest: any) {
    return RequestsModel.create(newRequest)
  }
}

export const requestsRepository = new RequestsRepository()
