import {injectable} from "inversify";
import {CommentModel} from "../../db/models";
import {LIKE_STATUS_ENUM} from "../../interfaces";

@injectable()
export class CommentsQueryRepository {
  async getCommentsCount(postId: string) {
    return CommentModel.countDocuments({postId})
  }

  /// move to commentsQueryRep?
  /// typization
  async getCommentsByPostId(postId: string, projection: any, findOptions: any, userId: string): Promise<any> {
    const {sort, skip, limit} = findOptions
    const comments = await CommentModel
      .find({postId})
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment?.commentatorInfo?.userId,
        userLogin: comment?.commentatorInfo?.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.LIKE).length,
        dislikesCount: comment.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.DISLIKE).length,
        myStatus: comment.likes.find(like => like.userId === userId)?.likeStatus ?? 'None'
      }
    }))
  }

  /// projection in params with default or hardcode
  async getCommentById(id: string, projection = {_id: 0, postId: 0}) {
    return CommentModel.findOne({id}, projection).lean()
  }

  async getCommentByIdAndUserIdIfExist(id: string, userId: string) {
    const comment = await CommentModel.findOne({id}, {_id: 0, __v: 0, postId: 0}).lean()
    console.log('comment', comment)
    if (comment) {
      return {
        id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo?.userId,
          userLogin: comment.commentatorInfo?.userLogin,

        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.LIKE).length,
          dislikesCount: comment.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.DISLIKE).length,
          myStatus: comment.likes.find(like => like.userId === userId)?.likeStatus ?? 'None'
        }
      }
    } else {
      return null
    }
  }
}
