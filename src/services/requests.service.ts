import {RequestsRepository} from "../repositories/requests";

export class RequestsService {
  constructor(protected requestsRepository: RequestsRepository) {
  }

  async increaseRequestCount(newRequest: any) {
    return this.requestsRepository.increaseRequestCount(newRequest)
  }
}

