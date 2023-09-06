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
  async getBlogPostsById(
    blogId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'asc',
    pagesCount: number,
    page: number = 1
  ) {

    const skipCount = (page - 1) * pageSize
    const postsFindOptions: FindOptions = {
      projection: {_id: 0},
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: Number(pageSize)
    }

    const posts = await postsCollection.find({blogId}, postsFindOptions).toArray()
    const totalCount = posts.length
    const totalPagesCount = Math.ceil(posts.length / Number(pageSize))

    return {
      pagesCount: totalPagesCount,
      page,
      pageSize: Number(pageSize),
      totalCount,
      items: posts
    }

  },

  async createBlog(newBlog: IBlog): Promise<IBlog> {
    // insertOne mutates the object
    await blogsCollection.insertOne(newBlog)

    return newBlog
  },

  async createBlogPost(title: string, shortDescription: string, content: string, blogId: string) {
    const blog = await blogsCollection.findOne<IBlog | null>({id: blogId}, {projection: {_id: 0}})
    const newBlogPost: IPost = {
      id: uuidv4(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog?.name || 'blog_name',
      createdAt: new Date().toISOString()
    }

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
