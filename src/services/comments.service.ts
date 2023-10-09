import {FindOptions, SortDirection} from "mongodb"
import {v4 as uuidv4} from "uuid"
import {CommentViewInterface, PaginationInterface} from "../interfaces"
import {CommentsRepository} from "../repositories/comments"
import {CommentsQueryRepository} from "../repositories/comments/query"

export class CommentsService {
  commentsRepository: CommentsRepository
  commentsQueryRepository: CommentsQueryRepository

  constructor() {
    this.commentsRepository = new CommentsRepository()
    this.commentsQueryRepository = new CommentsQueryRepository()
  }

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

    return await this.commentsRepository.createComment(newComment)
  }

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

    const comments = await this.commentsQueryRepository.getCommentsByPostId(postId, projection, findOptions, userId)
    const totalCount = await this.commentsQueryRepository.getCommentsCount(postId)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments
    }
  }

  async updatedCommentById(id: string, content: string): Promise<boolean> {
    const response = await this.commentsRepository.updateCommentById(id, content)
    return !!response?.modifiedCount
  }

  async deleteCommentById(id: string) {
    const response = await this.commentsRepository.deleteCommentById(id)
    return !!response.deletedCount
  }
}

export const commentsService = new CommentsService()
