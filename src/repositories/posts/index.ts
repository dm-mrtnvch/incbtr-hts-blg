import {DeleteResult, UpdateResult} from "mongodb";
import {PostModel} from "../../db/models";
import {IPost} from "../../interfaces";

export class PostsRepository {
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
  }

  async createPost(newPost: any): Promise<any> {
    try {
      const createdPost = await PostModel.create(newPost)
      const {
        id, title, shortDescription, content, blogId, blogName, createdAt,
        extendedLikesInfo: {
          dislikesCount, likesCount, myStatus, newestLikes
        }
      } = createdPost;
      return {
        id,
        title,
        shortDescription,
        content,
        blogId,
        blogName,
        createdAt,
        extendedLikesInfo: {
          dislikesCount,
          likesCount,
          myStatus,
          newestLikes
        }
      }
    } catch (e) {
      console.log(`createPost error: ${e}`);
    }
  }

  async updatePostById(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<UpdateResult> {
    return PostModel.updateOne({blogId}, {
      $set: {
        blogId,
        title,
        shortDescription,
        content
      }
    })
  }

  async deletePostById(id: string): Promise<DeleteResult> {
    return PostModel.deleteOne({id})
  }
}

export const postsRepository = new PostsRepository()
