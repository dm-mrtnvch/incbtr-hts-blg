import {blogsCollection, postsCollection} from "../../db/db";
import {blogsDb, postsDb} from "../../db/mock_data";
import {IPost} from "../../interfaces";
import {blogsRepository} from "../blogs";
import { v4 as uuidv4 } from 'uuid';

export const postsRepository = {
  async getAllPosts(): Promise<IPost[]> {
    // no await because of await in router
    return postsCollection.find({}, {projection: {_id: 0}}).toArray()
  },
  async getPostById(id: string): Promise<IPost | null> {
    return postsCollection.findOne({id})
  },
  async createPost(title: string, shortDescription: string, content: string, blogId: string) {
    const blog = await blogsCollection.findOne({id: blogId}, {projection: {_id: 0}})

    if (blog) {
      const newPost = {
        id: uuidv4(),
        title,
        content,
        shortDescription,
        blogId,
        blogName: blog.name
      }

      await postsCollection.insertOne({...newPost})

      return {
        ...newPost
      }
    } else {
      return false
    }
  },
  async updatePostById(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
    const response = await postsCollection.updateOne({blogId}, {
      $set: {
        blogId,
        title,
        shortDescription,
        content
      }
    })

    return !!response.modifiedCount
  },

  async deletePostById(id: string): Promise<boolean> {
    const result = await postsCollection.deleteOne({id})
    return !!result.deletedCount
  }
}
