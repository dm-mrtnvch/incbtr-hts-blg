import {inject, injectable} from "inversify";
import {RequestsRepository} from "../repositories/requests";

@injectable()
export class RequestsService {
  constructor(
    @inject(RequestsRepository) private requestsRepository: RequestsRepository
  ) {
  }

  async increaseRequestCount(newRequest: any) {
    return this.requestsRepository.increaseRequestCount(newRequest)
  }
}

