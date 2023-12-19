import {UpdateResult} from "mongodb";
import {CommentModel} from "../../db/models";
import {LIKE_STATUS_ENUM} from "../../interfaces";

export class CommentsRepository {
  async createComment(newComment: any) {
    const createdComment = await CommentModel.create(newComment)

    const {id, content, createdAt, commentatorInfo} = createdComment;
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
  }

  async updateCommentById(id: string, content: string): Promise<UpdateResult> {
    return CommentModel.updateOne({id}, {
      $set: {
        content
      }
    })
  }

  async deleteCommentById(id: string) {
    return CommentModel.deleteOne({id})
  }
}
