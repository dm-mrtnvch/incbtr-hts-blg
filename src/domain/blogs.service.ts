import {FindOptions} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {blogsCollection, postsCollection} from "../db/db";
import {IBlog, IPost} from "../interfaces";
import {blogsRepository} from "../repositories/blogs";

export const blogsService = {
  getAllBlogs() {
    return blogsRepository.getAllBlogs()
  },
  getBlogById(id: string): Promise<IBlog | null>{
    return blogsRepository.getBlogById(id)
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
      // @ts-ignore
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: Number(pageSize)
    }

    const posts = await blogsRepository.getBlogPostsById(blogId, postsFindOptions)
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


  async createBlog(name: string, description: string, websiteUrl: string) {
    const newBlog: any = {
      id: uuidv4(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false
    }

    return blogsRepository.createBlog({...newBlog})
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

    await blogsRepository.createBlogPost(newBlogPost)

    return newBlogPost
  },
  async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<boolean> {
    return blogsRepository.updateBlogById(id, name, description, websiteUrl)
  },
  async deleteBlogById(id: string): Promise<boolean> {
    return blogsRepository.deleteBlogById(id)
  }
}
