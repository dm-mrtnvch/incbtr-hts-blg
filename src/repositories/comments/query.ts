import {CommentModel} from "../../db/models";
import {CommentViewInterface, LIKE_STATUS_ENUM} from "../../interfaces";

export const commentsQueryRepository = {
  async getCommentsCount(postId: string) {
    console.log('postId', postId)
    return CommentModel.countDocuments({postId})
  },

  /// move to commentsQueryRep?
  /// typization
  async getCommentsByPostId(postId: string, projection: any, findOptions: any, userId: string): Promise<any> {
    const {sort, skip, limit} = findOptions
    const comments =  await CommentModel
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
        userLogin:comment?.commentatorInfo?.userLogin,
      },
      createdAt:comment.createdAt,
      likesInfo: {
        likesCount: comment.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.LIKE).length,
        dislikesCount: comment.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.DISLIKE).length,
        myStatus: comment.likes.find(like => like.userId === userId)?.likeStatus ?? 'None'
      }
    }))
  },

  /// projection in params with default or hardcode
  async getCommentById(id: string, projection = {_id: 0, postId: 0}) {
    return CommentModel.findOne({id}, projection).lean()
  },


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

// `  - Expected  - 2
//   + Received  + 6
//
// @@ -6,9 +6,13 @@
//   "createdAt": "2023-10-08T16:47:38.024Z",
//   "likesInfo": Object {
//   "dislikesCount": 0,
//     -     "likesCount": 1,
//     -     "myStatus": "Like",
//     +     "likesCount": 0,
//     +     "myStatus": Object {
//     +       "likeStatus": "Like",
//       +       "userId": "cea954c9-d5c0-41eb-b3a8-18628de9e5d9",
//       +       "userName": "7208lg",
//       +     },
// },
// }`
