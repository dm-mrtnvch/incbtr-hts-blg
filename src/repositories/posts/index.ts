import {DeleteResult, UpdateResult} from "mongodb";
import {PostModel} from "../../db/models";
import {IPost, LIKE_STATUS_ENUM} from "../../interfaces";

export class PostsRepository {
  /// typization
  async getAllPosts(filterOptions: any, projection: any, findOptions: any, userId: string): Promise<any> {
    const {sort, skip, limit} = findOptions

    const posts = await PostModel
      .find(filterOptions)
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        dislikesCount: post.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.DISLIKE).length ?? 0,
        likesCount: post.likes.filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.LIKE).length ?? 0,
        myStatus: post.likes.find((like: any) => like.userId === userId)?.likeStatus ?? 'None',
        newestLikes: post.likes
          .filter((like: any) => like.likeStatus === LIKE_STATUS_ENUM.LIKE)
          // @ts-ignore
          .sort((a: any, b: any) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map((l: any) => ({
            userId: l.userId,
            login: l.login,
            addedAt: l.createdAt
          })) ?? []
      }
    })) as any
  }

  async createPost(newPost: any): Promise<any> {
    try {
      const createdPost = await PostModel.create(newPost) as any
      const {id, title, shortDescription, content, blogId, blogName, createdAt} = createdPost;
      return {
        id,
        title,
        shortDescription,
        content,
        blogId,
        blogName,
        createdAt,
        likes: []
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
