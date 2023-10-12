import {PostModel} from "../../db/models";
import {IPost, LIKE_STATUS_ENUM} from "../../interfaces";

export class PostsQueryRepository {
  async getPostById(id: string): Promise<any> {
    return PostModel
      .findOne({id})
      .select({_id: 0, __v: 0})
      .lean()
  }

  async getPostByIdAndUserId(id: string, userId: string): Promise<any> {
    const post = await PostModel
      .findOne({id})
      .select({_id: 0, __v: 0})
      .lean() as any
    // id: String,
    //   title: String,
    //   shortDescription: String,
    //   content: String,
    //   blogId: String,
    //   blogName: String,
    //   createdAt: String,
    //   likes: [postLikeSchema]

    if (!post) {
      return null
    }

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        dislikesCount: post.likes.find((like: any) => like.likeStatus === LIKE_STATUS_ENUM.DISLIKE) ?? 0,
        likesCount: post.likes.find((like: any) => like.likeStatus === LIKE_STATUS_ENUM.LIKE) ?? 0,
        myStatus: post.likes.find((like: any) => like.userId === userId) || 'None',
        newestLikes: []
      }
    }
  }


  async getAllPostsCount(filterOptions: any): Promise<number> {
    return PostModel.countDocuments(filterOptions)
  }
}

export const postsQueryRepository = new PostsQueryRepository()
