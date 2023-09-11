import {commentsCollection} from "../../db/db";

export const commentsRepository = {
  async createComment(newComment: any) {
    await commentsCollection.insertOne({...newComment})
    return newComment
  }
}
