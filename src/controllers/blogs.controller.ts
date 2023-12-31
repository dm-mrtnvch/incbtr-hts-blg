import {Response} from "express";
import {inject, injectable} from "inversify";
import {
  IBlogRequest,
  IPaginationRequest,
  IPaginationWithSearchRequest, IPostRequest, RequestWithBody,
  RequestWithParams, RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../interfaces";
import {BlogsQueryRepository} from "../repositories/blogs/query";
import {BlogsService} from "../services/blogs.service";

@injectable()
export class BlogsController {
  constructor(
    @inject(BlogsService) private blogsService: BlogsService,
    @inject(BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository
  ) {
  }

  async getBlogs(req: RequestWithQuery<IPaginationWithSearchRequest>, res: Response) {
    const {searchNameTerm, pageNumber, pageSize, sortBy, sortDirection} = req.query
    const blogs = await this.blogsService.getAllBlogs(
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    )
    res.send(blogs)
  }

  async getBlog(req: RequestWithParams<{ id: string }>, res: Response) {
    const blog = await this.blogsQueryRepository.getBlogById(req.params.id)

    if (blog) {
      res.send(blog)
    } else {
      res.sendStatus(404)
    }
  }

  async getPosts(req: RequestWithParamsAndQuery<{ blogId: string }, IPaginationRequest>, res: Response) {
    const {blogId} = req.params
    const {pageNumber, pageSize, sortBy, sortDirection} = req.query
    const isBlogExist = await this.blogsQueryRepository.getBlogById(blogId)

    if (!isBlogExist) {
      res.sendStatus(404)
      return
    }

    const blogPosts = await this.blogsService.getBlogPostsById(
      blogId,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      req.userId
    )
    res.send(blogPosts)
  }

  async createBlog(req: RequestWithBody<IBlogRequest>, res: Response) {
    const {name, description, websiteUrl} = req.body
    const newBlog = await this.blogsService.createBlog(name, description, websiteUrl)

    res.status(201).send(newBlog)
  }

  async createPost(req: RequestWithParamsAndBody<{ blogId: string }, IPostRequest>, res: Response) {
    const {blogId} = req.params
    const {title, shortDescription, content} = req.body
    const isBlogExist = await this.blogsQueryRepository.getBlogById(blogId)

    if (!isBlogExist) {
      res.sendStatus(404)
      return
    }

    const newBlogPost = await this.blogsService.createBlogPost(title, shortDescription, content, blogId)
    res.status(201).send(newBlogPost)
  }

  async updateBlog(req: RequestWithParamsAndBody<{ id: string }, IBlogRequest>, res: Response) {
    const {id} = req.params
    const {name, description, websiteUrl} = req.body
    const isBlogUpdated = await this.blogsService.updateBlogById(id, name, description, websiteUrl)

    if (isBlogUpdated) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  }

  async deleteBlog(req: RequestWithParams<{ id: string }>, res: Response) {
    const {id} = req.params
    const isBlogDeleted = await this.blogsService.deleteBlogById(id)

    if (isBlogDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  }
}


