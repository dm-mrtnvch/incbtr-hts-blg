import {usersCollection} from "../../db/db";

export const usersQueryRepository = {
  getAllUsersCount(filterOptions: any) {
    const {login, email}: any = filterOptions
    return usersCollection.countDocuments({$or: [{login}, {email}]})
  },
  getUserById(id: string){
    return usersCollection.findOne({id}, {projection: {password: 0}})
  }
}
