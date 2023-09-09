import {DeleteResult, FindOptions, UpdateResult} from "mongodb";
import {blogsCollection, postsCollection} from "../../db/db";
import {blogsDb, postsDb} from "../../db/mock_data";
import {IPost} from "../../interfaces";
import {blogsRepository} from "../blogs";
import { v4 as uuidv4 } from 'uuid';

export const postsRepository = {
  async getAllPosts(postsFindOptions: FindOptions): Promise<IPost[]> {
    return postsCollection.find({}, postsFindOptions).toArray()
  },
  async createPost(newPost: IPost) {
    /// ?
    return postsCollection.insertOne({...newPost})

  },
  async updatePostById(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<UpdateResult> {
    return postsCollection.updateOne({blogId}, {
      $set: {
        blogId,
        title,
        shortDescription,
        content
      }
    })
  },

  async deletePostById(id: string): Promise<DeleteResult> {
    /// where to check deletion? service / repository?
    return postsCollection.deleteOne({id})

  }
}
