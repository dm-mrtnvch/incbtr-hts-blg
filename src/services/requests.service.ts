import {RequestsModel} from "../db/models";
import {requestsRepository} from "../repositories/requests";

export const requestsService = {
  async increaseRequestCount(newRequest: any) {
    return requestsRepository.increaseRequestCount(newRequest)
  }
}
