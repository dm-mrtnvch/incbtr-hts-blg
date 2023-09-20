import {Response, Router} from "express"
import {checkSchema} from "express-validator";
import {
  IBlogRequest,
  IPaginationRequest,
  IPaginationWithSearchRequest,
  IPostRequest,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../interfaces";
import {BasicAuthMiddleware, RequestErrorsValidationMiddleware} from "../middlewares/middlewares";
import {blogsQueryRepository} from "../repositories/blogs/query";
import {blogsService} from "../services/blogs.service";
import {
  blogCreateUpdateValidationSchema,
  paginationSanitizationSchema,
  postValidationSchema
} from "../validation/auth";

export const blogsRouter = Router()

blogsRouter.get('/',
  checkSchema(paginationSanitizationSchema),
  async (req: RequestWithQuery<IPaginationWithSearchRequest>, res: Response) => {
    const {searchNameTerm, pageNumber, pageSize, sortBy, sortDirection} = req.query
    const blogs = await blogsService.getAllBlogs(
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    )
    res.send(blogs)
  })

blogsRouter.get('/:id',
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const blog = await blogsQueryRepository.getBlogById(req.params.id)

    if (blog) {
      res.send(blog)
    } else {
      res.sendStatus(404)
    }
  })

blogsRouter.get('/:blogId/posts',
  checkSchema(paginationSanitizationSchema),
  async (req: RequestWithParamsAndQuery<{ blogId: string }, IPaginationRequest>, res: Response) => {
    const {blogId} = req.params
    const {pageNumber, pageSize, sortBy, sortDirection} = req.query
    const isBlogExist = await blogsQueryRepository.getBlogById(blogId)

    if (!isBlogExist) {
      res.sendStatus(404)
      return
    }

    const blogPosts = await blogsService.getBlogPostsById(
      blogId,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    )
    res.send(blogPosts)
  })

blogsRouter.post('/',
  BasicAuthMiddleware,
  checkSchema(blogCreateUpdateValidationSchema),
  RequestErrorsValidationMiddleware,
  async (req: RequestWithBody<IBlogRequest>, res: Response) => {
    const {name, description, websiteUrl} = req.body
    const newBlog = await blogsService.createBlog(name, description, websiteUrl)

    res.status(201).send(newBlog)
  })

blogsRouter.post('/:blogId/posts',
  BasicAuthMiddleware,
  checkSchema(postValidationSchema),
  RequestErrorsValidationMiddleware,
  async (req: RequestWithParamsAndBody<{ blogId: string }, IPostRequest>, res: Response) => {
    const {blogId} = req.params
    const {title, shortDescription, content} = req.body
    const isBlogExist = await blogsQueryRepository.getBlogById(blogId)

    if (!isBlogExist) {
      res.sendStatus(404)
      return
    }

    const newBlogPost = await blogsService.createBlogPost(title, shortDescription, content, blogId)
    res.status(201).send(newBlogPost)
  })

blogsRouter.put('/:id',
  BasicAuthMiddleware,
  checkSchema(blogCreateUpdateValidationSchema),
  RequestErrorsValidationMiddleware,
  async (req: RequestWithParamsAndBody<{ id: string }, IBlogRequest>, res: Response) => {
    const {id} = req.params
    const {name, description, websiteUrl} = req.body
    const isBlogUpdated = await blogsService.updateBlogById(id, name, description, websiteUrl)

    if (isBlogUpdated) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })

blogsRouter.delete('/:id',
  BasicAuthMiddleware,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const {id} = req.params
    const isBlogDeleted = await blogsService.deleteBlogById(id)

    if (isBlogDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
