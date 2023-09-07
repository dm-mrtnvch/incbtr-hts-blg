import {DeleteResult, FindOptions} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {blogsCollection, postsCollection} from "../db/db";
import {IPost} from "../interfaces";
import {postsRepository} from "../repositories/posts";
import {blogsService} from "./blogs.service";

export const postsService = {
  async getAllPosts(pageNumber: number = 1,
                    pageSize: number = 10,
                    sortBy: string = 'createdAt',
                    sortDirection: string = 'desc') {
    const skipCount = (pageNumber - 1) * pageSize
    const postsFindOptions: FindOptions = {
      projection:{_id: 0},
      // @ts-ignore
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: Number(pageSize)
    }
    const posts = await postsRepository.getAllPosts(postsFindOptions)
    const postsForLength = await postsRepository.getAllPosts({})
    return  {
      pagesCount: Math.ceil(postsForLength.length /  pageSize),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: postsForLength.length,
      items: posts
    }
  },
  async getPostById(id: string): Promise<IPost | null> {
    return postsRepository.getPostById(id)
  },
  async createPost(title: string, shortDescription: string, content: string, blogId: string) {
    // const blog = await blogsCollection.findOne({id: blogId}, {projection: {_id: 0}})
    const blog = await blogsService.getBlogById(blogId)

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

    /// what about matched count?
    return !!updateResult.modifiedCount

  },

  async deletePostById(id: string): Promise<Boolean> {
    // is it appropriate place to make checks?
    const deleteResult = await postsRepository.deletePostById(id)
    return !!deleteResult.deletedCount
  }
}
