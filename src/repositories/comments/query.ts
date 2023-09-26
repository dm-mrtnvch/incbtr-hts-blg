import {CommentModel} from "../../db/db";
import {CommentViewInterface} from "../../interfaces";

export const commentsQueryRepository = {
  async getCommentsCount(filterOptions: any) {
    return CommentModel.countDocuments(filterOptions)
  },

  /// move to commentsQueryRep?
  /// typization
  async getCommentsByPostId(postId: string, projection: any, findOptions: any): Promise<CommentViewInterface> {
    const {sort, skip, limit} = findOptions

    return CommentModel
      .find({postId})
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  },

  /// projection in params with default or hardcode
  async getCommentById(id: string, projection = {_id: 0, postId: 0}) {
    return CommentModel.findOne({id}, projection)
  }
}

