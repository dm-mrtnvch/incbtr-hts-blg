import {FindOptions} from "mongodb";
import {v4 as uuidv4} from 'uuid';
import {blogsCollection, postsCollection} from "../../db/db";
import {IBlog, IPost} from "../../interfaces";
import {postsRepository} from "../posts";

export const blogsRepository = {
  async getAllBlogs(): Promise<IBlog[]> {
    return blogsCollection.find({}, {projection: {_id: 0}}).toArray()
  },
  async getBlogById(id: string): Promise<IBlog | null> {
    return blogsCollection.findOne({id}, {projection: {_id: 0}})
  },




  async getBlogPostsById(blogId: string, postsFindOptions: FindOptions) {
    return  await postsCollection.find({blogId}, postsFindOptions).toArray()
  },

  async createBlog(newBlog: IBlog): Promise<IBlog> {
    /// insertone mutates the object and add _id
    await blogsCollection.insertOne({...newBlog})
    /// response for insertOne {
    ///   acknowledged: true,
    ///     insertedId: new ObjectId("64f8dd93bf935ad52a20a1f5")
    /// }

    /// we have this object on service step
    /// not necessary to send this object into repository
    return newBlog
  },

  async createBlogPost(newBlogPost: IPost) {
    await postsCollection.insertOne({...newBlogPost})

    return newBlogPost
  },
  async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
    const isBlogExist = await blogsCollection.findOne({id})
    if (!isBlogExist) {
      return false
    }

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
