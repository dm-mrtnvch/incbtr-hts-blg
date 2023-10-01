import {UpdateResult} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {CommentModel} from "../../db/db";
import {LIKE_STATUS_ENUM} from "../../interfaces";

export const commentsRepository = {
  async createComment(newComment: any) {
    console.log('new', newComment)
    const createdComment = await CommentModel.create(newComment)

    const { id, content, createdAt, commentatorInfo } = createdComment;
    return {
      id,
      content,
      commentatorInfo: {
        /// i have these validations in filter
        userId: commentatorInfo?.userId,
        userLogin: commentatorInfo?.userLogin
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LIKE_STATUS_ENUM.NONE
      },
      createdAt,
    }
  },

  async updateCommentById(id: string, content: string): Promise<UpdateResult> {
    return CommentModel.updateOne({id}, {
      $set: {
        content
      }
    })
  },

  async deleteCommentById(id: string) {
    return CommentModel.deleteOne({id})
  }
}
