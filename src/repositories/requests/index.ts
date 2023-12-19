import {injectable} from "inversify";
import {RequestsModel} from "../../db/models";

@injectable()
export class RequestsRepository {
  async increaseRequestCount(newRequest: any) {
    return RequestsModel.create(newRequest)
  }
}

