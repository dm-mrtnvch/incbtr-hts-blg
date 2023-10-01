import {requestsRepository} from "../repositories/requests";

class RequestsService {
  async increaseRequestCount(newRequest: any) {
    return requestsRepository.increaseRequestCount(newRequest)
  }
}

export const requestsService = new RequestsService()
