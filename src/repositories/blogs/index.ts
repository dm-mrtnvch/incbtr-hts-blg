import {v4 as uuidv4} from 'uuid';
import {blogsCollection} from "../../db/db";
import {IBlog} from "../../interfaces";

export const blogsRepository = {
  async getAllBlogs(): Promise<IBlog[]> {
    return blogsCollection.find({}, {projection: {_id: 0}}).toArray()
  },
  async getBlogById(id: string): Promise<IBlog | null>{
    return blogsCollection.findOne({id}, {projection: {_id: 0}})
  },
  async createBlog(name: string, description: string, websiteUrl: string) {
    const newBlog: any = {
      id: uuidv4(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false
    }
    // insertOne mutates the object
   await blogsCollection.insertOne({...newBlog})

    return {
      ...newBlog
    }
  },
  async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
    const isBlogExist = await blogsCollection.findOne({id})
    if(!isBlogExist) {
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
