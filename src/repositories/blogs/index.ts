import {FilterQuery} from "mongoose";
import {BlogModel, PostModel} from "../../db/models";
import {IBlog, IPost} from "../../interfaces";

export class BlogsRepository {
  /// typization ??
  async getAllBlogs(filterOptions: FilterQuery<IBlog>, projection: any, findOptions: any) {
    const {sort, skip, limit} = findOptions

    return BlogModel
      .find(filterOptions)
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  }

  /// send blogId and -> .find({blogId}) or send and filteroptions = {blogId}
  async getBlogPostsById(blogId: string, projection: any, findOptions: any): Promise<any> { /// typization
    const {sort, skip, limit} = findOptions

    return PostModel
      .find({blogId})
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  }

  async createBlog(newBlog: IBlog): Promise<IBlog | void> { /// is void type ok?
    try {
      const createdBlog = await BlogModel.create(newBlog)
      const {id, name, description, websiteUrl, isMembership, createdAt} = createdBlog

      return {
        id,
        name,
        description,
        websiteUrl,
        isMembership,
        createdAt,
      }
    } catch (e) {
      console.log(`createBlog error: ${e}`)
    }
  }

  async createBlogPost(newBlogPost: IPost): Promise<IPost | void> {
    try {
      const newPost = await PostModel.create({...newBlogPost})
      const {
        id, title, shortDescription, content, blogId, blogName, createdAt,
        extendedLikesInfo: {
          likesCount, newestLikes, dislikesCount, myStatus
        }
      }: IPost = newPost

      return {
        id,
        title,
        shortDescription,
        content,
        blogId,
        blogName,
        createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
          newestLikes
        }
      }
    } catch (e) {
      console.log(`createBlogPost error: ${e}`)
    }
  }


  async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<boolean | void> {
    const isBlogExist = await BlogModel.findOne({id})
    if (!isBlogExist) return false

    try {
      const response = await BlogModel.updateOne({id}, {
        $set: {
          name,
          description,
          websiteUrl
        }
      })

      return !!response.modifiedCount
    } catch (e) {
      console.log(`updateBlogById error: ${e}`)
    }
  }

  async deleteBlogById(id: string): Promise<boolean | void> {
    try {
      const response = await BlogModel.deleteOne({id})
      return !!response.deletedCount
    } catch (e) {
      console.log(`deleteBlogById error: ${e}`)
    }
  }
}

export const blogsRepository = new BlogsRepository()
