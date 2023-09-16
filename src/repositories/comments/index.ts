import {v4 as uuidv4} from "uuid";
import {commentsCollection} from "../../db/db";

export const commentsRepository = {
  async createComment(newComment: any) {
    const {
      postId,
      ...commentToReturn
    } = newComment

    console.log('newComment', newComment)
    console.log('postId', postId)
    console.log('commentToReturn', commentToReturn)

    await commentsCollection.insertOne({...newComment})
    /// why without {}
    return commentToReturn
  },
  /// move to commentsQueryRep?
  async getCommentsByPostId(filterOptions: any, findOptions: any){
    return commentsCollection.find(filterOptions, findOptions).toArray();
  },
  async updateCommentById(id: string, content: string) {
    return commentsCollection.updateOne({id}, {
      $set : {
        content
      }
    })
  }
}
