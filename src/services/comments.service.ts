import {FindOptions, SortDirection} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {commentsCollection} from "../db/db";
import {commentsRepository} from "../repositories/comments";
import {commentsQueryRepository} from "../repositories/comments/query";
import {usersQueryRepository} from "../repositories/users/query";


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
      postId
    }

    return await commentsRepository.createComment(newComment)
  },
  async getCommentsByPostId(
    postId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: SortDirection = 'desc',
  ) {



    const skipCount = (pageNumber - 1) * pageSize
    const filterOptions = {
      postId
    }

    const findOptions: FindOptions = {
      projection: {_id: 0, postId: 0},
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize
    }

    const comments = await commentsRepository.getCommentsByPostId(filterOptions,findOptions)
    const totalCount = await commentsQueryRepository.getCommentsCount(filterOptions)
    const pagesCount = Math.ceil( totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments
    }
  },
  async updatedCommentById(id: string, content: string){
    const response =  await commentsRepository.updateCommentById(id, content)
    return !!response.modifiedCount

  },
  async deleteCommentById(id: string){
    const response =  await commentsCollection.deleteOne({id})
    return !!response.deletedCount
  }
}
