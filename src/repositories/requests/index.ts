import {RequestsModel} from "../../db/models";

export const requestsRepository = {
  async increaseRequestCount(newRequest: any){
      return RequestsModel.create(newRequest)
  }
}
