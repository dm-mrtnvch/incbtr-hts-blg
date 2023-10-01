import {FindOptions, SortDirection, UpdateResult} from "mongodb";
import {v4 as uuidv4} from "uuid";

import {CommentModel} from "../db/models";
import {CommentViewInterface, PaginationInterface} from "../interfaces";
import {commentsRepository} from "../repositories/comments";
import {commentsQueryRepository} from "../repositories/comments/query";


export const commentsService = {
  async createComment(content: string, userId: string, userLogin: string, postId: string) {
    const newComment = {
      id: uuidv4(),
      content,
      commentatorInfo: {
        userId,
        userLogin
      },
      createdAt: new Date().toISOString(),
      postId,
      likes: []
    }

    return await commentsRepository.createComment(newComment)
  },

  async getCommentsByPostId(
    postId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: SortDirection = 'desc',
    userId: string,
  ): Promise<PaginationInterface<CommentViewInterface>> {

    const skipCount = (pageNumber - 1) * pageSize

    const projection = {
      _id: 0,
      __v: 0,
      postId: 0
    }

    const findOptions: FindOptions = {
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize
    }

    const comments = await commentsQueryRepository.getCommentsByPostId(postId, projection, findOptions, userId)
    const totalCount = await commentsQueryRepository.getCommentsCount(postId)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments
    }
  },

  async updatedCommentById(id: string, content: string): Promise<boolean> {
    const response = await commentsRepository.updateCommentById(id, content)
    return !!response?.modifiedCount
  },

  async deleteCommentById(id: string) {
    const response = await commentsRepository.deleteCommentById(id)
    return !!response.deletedCount
  }
}
