import {injectable} from "inversify";
import {FilterQuery} from "mongoose";
import {BlogModel, PostModel} from "../../db/models";
import {IBlog, IPost, LIKE_STATUS_ENUM} from "../../interfaces";

@injectable()
export class BlogsRepository {
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
  }

  /// send blogId and -> .find({blogId}) or send and filteroptions = {blogId}
  async getBlogPostsById(blogId: string, projection: any, findOptions: any, userId: string): Promise<any> { /// typization
    const {sort, skip, limit} = findOptions

    const posts = await PostModel
      .find({blogId})
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
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
        createdAt,
      }
    } catch (e) {
      console.log(`createBlog error: ${e}`)
    }
  }

  async createBlogPost(newBlogPost: any): Promise<any> {
    try {
      const newPost = await PostModel.create({...newBlogPost}) as any
      const {id, title, shortDescription, content, blogId, blogName, createdAt} = newPost

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
      console.log(`createBlogPost error: ${e}`)
    }
  }


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
  }

  async deleteBlogById(id: string): Promise<boolean | void> {
    try {
      const response = await BlogModel.deleteOne({id})
      return !!response.deletedCount
    } catch (e) {
      console.log(`deleteBlogById error: ${e}`)
    }
  }
}
