import {DeleteResult, FindOptions, SortDirection} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {BlogModel, postsCollection} from "../db/db";
import {IPost} from "../interfaces";
import {blogsQueryRepository} from "../repositories/blogs/query";
import {postsRepository} from "../repositories/posts";
import {postsQueryRepository} from "../repositories/posts/query";
import {blogsService} from "./blogs.service";

export const postsService = {
  async getAllPosts(pageNumber: number = 1,
                    pageSize: number = 10,
                    sortBy: string = 'createdAt',
                    sortDirection: SortDirection = 'desc') {
    const skipCount = (pageNumber - 1) * pageSize
    const postsFindOptions: FindOptions = {
      projection: {_id: 0},
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize
    }
    const posts = await postsRepository.getAllPosts(postsFindOptions)
    const totalCount = await postsQueryRepository.getAllPostsCount({})
    const totalPagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: totalPagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts
    }
  },
  async createPost(title: string, shortDescription: string, content: string, blogId: string) {
    const blog = await blogsQueryRepository.getBlogById(blogId)

    if (blog) {
      const newPost = {
        id: uuidv4(),
        title,
        content,
        shortDescription,
        blogId,
        blogName: blog.name,
        createdAt: new Date().toISOString()
      }

      await postsRepository.createPost({...newPost})

      return {
        ...newPost
      }
    } else {
      return false
    }
  },
  async updatePostById(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
    const updateResult = await postsRepository.updatePostById(id, title, shortDescription, content, blogId)
    return !!updateResult.modifiedCount
  },

  async deletePostById(id: string): Promise<Boolean> {
    const deleteResult = await postsRepository.deletePostById(id)
    return !!deleteResult.deletedCount
  }
}
