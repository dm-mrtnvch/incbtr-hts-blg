import {DeleteResult, FindOptions, UpdateResult} from "mongodb";
import {BlogModel, PostModel} from "../../db/db";
import {blogsDb, postsDb} from "../../db/mock_data";
import {IPost} from "../../interfaces";
import {blogsRepository} from "../blogs";
import {v4 as uuidv4} from 'uuid';

export const postsRepository = {
  /// typization
  async getAllPosts(filterOptions: any, projection: any, findOptions: any): Promise<IPost[]> {
    const {sort, skip, limit} = findOptions

    return PostModel
      .find(filterOptions)
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
  },

  async createPost(newPost: IPost): Promise<IPost | void> {
    try {
      const createdPost = await PostModel.create(newPost)
      const {id, title, shortDescription, content, blogId, blogName, createdAt} = createdPost

      return {
        id,
        title,
        shortDescription,
        content,
        blogId,
        blogName,
        createdAt,
      }
    } catch (e) {
      console.log(`createPost error: ${e}`);
    }
  },

  async updatePostById(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<UpdateResult> {
    return PostModel.updateOne({blogId}, {
      $set: {
        blogId,
        title,
        shortDescription,
        content
      }
    })
  },

  async deletePostById(id: string): Promise<DeleteResult> {
    return PostModel.deleteOne({id})
  }
}
