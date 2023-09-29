import {RequestsModel} from "../../db/db";

export const requestsRepository = {
  async increaseRequestCount(newRequest: any){
      return RequestsModel.create(newRequest)
  }
}
