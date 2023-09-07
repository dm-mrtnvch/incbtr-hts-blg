import {FindOptions} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {blogsCollection, postsCollection} from "../db/db";
import {IBlog, IPost} from "../interfaces";
import {blogsRepository} from "../repositories/blogs";

export const blogsService = {
  /// in router we says than they are all strings
  async getAllBlogs(
    searchNameTerm: string | null = null,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
    pageNumber: number = 1,
    pageSize: number = 10) {

    const skipCount = (pageNumber - 1) * pageSize
    const blogsFindOptions: FindOptions = {
      projection: {_id: 0},
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      /// by default it's number but if pass it's string
      limit: Number(pageSize),
    }
    const filterOptions = {
      ...(searchNameTerm && {name: new RegExp(searchNameTerm, 'i')})
    }

    const blogs = await blogsRepository.getAllBlogs(filterOptions, blogsFindOptions)
    const blogsForLength = await blogsRepository.getAllBlogs({}, {})
    const totalPagesCount = Math.ceil(blogs.length / Number(pageSize))
    return {
      pagesCount: totalPagesCount,
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: blogs.length,
      items: blogs
    }
  },
  getBlogById(id: string): Promise<IBlog | null>{
    return blogsRepository.getBlogById(id)
  },


  async getBlogPostsById(
    blogId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc',
  ) {

    const skipCount = (pageNumber - 1) * pageSize
    const postsFindOptions: FindOptions = {
      projection: {_id: 0},
      // @ts-ignore
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: Number(pageSize)
    }

    // two requests to getBlogPostsById
    const posts = await blogsRepository.getBlogPostsById(blogId, postsFindOptions)
    const postForPagesCounting = await blogsRepository.getBlogPostsById(blogId, {})
    const totalCount = postForPagesCounting.length
    const totalPagesCount = Math.ceil(postForPagesCounting.length / Number(pageSize))

    return {
      pagesCount: totalPagesCount,
      page: pageNumber,
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

    return blogsRepository.createBlog(newBlog)
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

