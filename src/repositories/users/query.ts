import {usersCollection} from "../../db/db";

export const usersQueryRepository = {
  getAllUsersCount(filterOptions: any) {
    return usersCollection.countDocuments(filterOptions)
  },
  getUserById(id: string){
    return usersCollection.findOne({id})
  }
}
