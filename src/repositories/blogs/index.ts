import {Filter, FindOptions} from "mongodb";
import {blogsCollection, postsCollection} from "../../db/db";
import {IBlog, IPost} from "../../interfaces";

export const blogsRepository = {
  async getAllBlogs(filterOptions: Filter<IBlog>, blogsFindOptions: FindOptions): Promise<IBlog[]> {
    return blogsCollection.find(filterOptions, blogsFindOptions).toArray()
  },
  async getBlogPostsById(blogId: string, postsFindOptions: FindOptions): Promise<any> {
    return await postsCollection.find({blogId}, postsFindOptions).toArray()
  },
  // !! use query repository for get
  async createBlog(newBlog: IBlog): Promise<IBlog> {
    await blogsCollection.insertMany({...newBlog})
    return newBlog
  },
  async createBlogPost(newBlogPost: IPost): Promise<IPost> {
    await postsCollection.insertOne({...newBlogPost})
    return newBlogPost
  },
  async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
    const isBlogExist = await blogsCollection.findOne({id})

    if (!isBlogExist) return false

    const response = await blogsCollection.updateOne({id}, {
      $set: {
        name,
        description,
        websiteUrl
      }
    })

    return !!response.modifiedCount
  },
  async deleteBlogById(id: string): Promise<boolean> {
    const response = await blogsCollection.deleteOne({id})

    return !!response.deletedCount
  }
}
