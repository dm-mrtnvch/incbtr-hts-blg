import {FilterQuery} from "mongoose";
import {BlogModel, postsCollection} from "../../db/db";
import {IBlog, IPost} from "../../interfaces";

export type ProjectionType = {}

export const blogsRepository = {
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
  },

  async getBlogPostsById(blogId: string, findOptions: any): Promise<any> { /// typization
    return postsCollection.find({blogId}, findOptions).toArray()
  },

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
        createdAt
      }
    } catch (e) {
      console.log(`createBlog error: ${e}`)
    }
  },


  async createBlogPost(newBlogPost: IPost): Promise<IPost> {
    await postsCollection.create({...newBlogPost})
    return newBlogPost
  },


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
  },
  async deleteBlogById(id: string): Promise<boolean | void> {
    try {
      const response = await BlogModel.deleteOne({id})
      return !!response.deletedCount
    } catch (e) {
      console.log(`deleteBlogById error: ${e}`)
    }
  }
}
