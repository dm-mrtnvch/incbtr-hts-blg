import {DeleteResult, FindOptions, SortDirection} from "mongodb";
import {v4 as uuidv4} from "uuid";

import {BlogModel, PostModel} from "../db/models";
import {IPost} from "../interfaces";
import {BlogsQueryRepository, blogsQueryRepository} from "../repositories/blogs/query";
import {PostsRepository, postsRepository} from "../repositories/posts";
import {PostsQueryRepository, postsQueryRepository} from "../repositories/posts/query";
import {blogsService} from "./blogs.service";

export class PostsService {
  postsRepository: PostsRepository
  postsQueryRepository: PostsQueryRepository
  blogsQueryRepository: BlogsQueryRepository

  constructor() {
    this.postsRepository = new PostsRepository()
    this.postsQueryRepository = new PostsQueryRepository()
    this.blogsQueryRepository = new BlogsQueryRepository()
  }

  async getAllPosts(pageNumber: number = 1,
                    pageSize: number = 10,
                    sortBy: string = 'createdAt',
                    sortDirection: SortDirection = 'desc') {

    const skipCount = (pageNumber - 1) * pageSize

    const postsFindOptions: FindOptions = {
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize
    }

    const projection = {
      _id: 0,
      __v: 0
    }

    /// null or {} ?
    const posts = await this.postsRepository.getAllPosts({}, projection, postsFindOptions)
    const totalCount = await this.postsQueryRepository.getAllPostsCount({})
    const totalPagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: totalPagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts
    }
  }

  async createPost(title: string, shortDescription: string, content: string, blogId: string) {
    const blog = await this.blogsQueryRepository.getBlogById(blogId)

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

      return await this.postsRepository.createPost(newPost)
    } else {
      return false
    }
  }

  async updatePostById(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
    const updateResult = await this.postsRepository.updatePostById(id, title, shortDescription, content, blogId)
    return !!updateResult.modifiedCount
  }

  async deletePostById(id: string): Promise<Boolean> {
    const deleteResult = await this.postsRepository.deletePostById(id)
    return !!deleteResult.deletedCount
  }
}

export const postsService = new PostsService()
