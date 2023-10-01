import {FindOptions, SortDirection} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {IBlog, IPost} from "../interfaces";
import {blogsRepository, ProjectionType,} from "../repositories/blogs";
import {blogsQueryRepository} from "../repositories/blogs/query";
import {postsQueryRepository} from "../repositories/posts/query";

class BlogsService  {
  async getAllBlogs(
    searchNameTerm: string | null = null,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: SortDirection = -1
) {
    const skipCount = (pageNumber - 1) * pageSize

    const filterOptions = {
      ...(searchNameTerm && {name: new RegExp(searchNameTerm, 'i')}),
    }

    const projection: ProjectionType = {
      _id: 0,
      __v: 0
    }

    //// FindOptions...
    const findOptions: any = {
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize,
    }

    const blogs: IBlog[] = await blogsRepository.getAllBlogs(filterOptions, projection, findOptions)
    const totalCount = await blogsQueryRepository.getAllBlogsCount(filterOptions)
    const totalPagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: totalPagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs
    }
  }

  async getBlogPostsById(
    blogId: string,
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: SortDirection = 'desc',
  ) {
    const skipCount = (pageNumber - 1) * pageSize
    const findOptions: FindOptions = {
      sort: {[sortBy]: sortDirection},
      skip: skipCount,
      limit: pageSize
    }

    const projection: ProjectionType = {
      _id: 0,
      __v: 0
    }

    const posts = await blogsRepository.getBlogPostsById(blogId, projection, findOptions)
    const totalCount = await postsQueryRepository.getAllPostsCount({blogId})
    const totalPagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: totalPagesCount,
      page: pageNumber,
      pageSize: Number(pageSize),
      totalCount,
      items: posts
    }
  }

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
  }
  async createBlogPost(title: string, shortDescription: string, content: string, blogId: string) {
    const blog = await blogsQueryRepository.getBlogById(blogId)
    const newBlogPost: IPost = {
      id: uuidv4(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog?.name || 'blog_name',
      createdAt: new Date().toISOString()
    }

    return blogsRepository.createBlogPost(newBlogPost)

  }
  /// extra void because of try catch
  async updateBlogById(id: string, name: string, description: string, websiteUrl: string): Promise<boolean | void> {
    return blogsRepository.updateBlogById(id, name, description, websiteUrl)
  }
  /// extra void because of try catch
  async deleteBlogById(id: string): Promise<boolean | void> {
    return blogsRepository.deleteBlogById(id)
  }
}

export const blogsService = new BlogsService()
