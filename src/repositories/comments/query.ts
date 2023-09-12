import {commentsCollection} from "../../db/db";

export const commentsQueryRepository = {
  async getCommentsCount(filterOptions: any){
    return commentsCollection.countDocuments(filterOptions)
  },
  async getCommentById(id: string){
    return commentsCollection.findOne({id}, {projection: {_id: 0, postId: 0}})
  }
}

