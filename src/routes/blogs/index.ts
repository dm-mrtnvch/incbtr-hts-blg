import {NextFunction, raw, Request, Response, Router} from "express"
import {body, check, query, validationResult} from "express-validator";
import {SortDirection} from "mongodb";
import {blogsCollection} from "../../db/db";
import {blogsQueryRepository} from "../../repositories/blogs/query";
import {blogsService} from "../../services/blogs.service";
import {toNumberOrUndefined, sortDirectionValueOrUndefined, errorsValidation} from "../../helpers/utils";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery, RequestWithQuery
} from "../../interfaces";
import {BasicAuthMiddleware} from "../../middlewares/middlewares";
import {blogsRepository} from "../../repositories/blogs";


export const blogsRouter = Router()

blogsRouter.get('/',
  query('pageNumber').customSanitizer(toNumberOrUndefined),
  query('pageSize').customSanitizer(toNumberOrUndefined),
  query('sortDirection').customSanitizer(sortDirectionValueOrUndefined),
  async (req: RequestWithQuery<{
    searchNameTerm?: string,
    pageNumber?: number,
    pageSize?: number
    sortBy?: string,
    // useless to write sortDirection: SortDirection || undefined as we declared that it's optional param,
    sortDirection?: SortDirection,
  }>, res: Response) => {
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

blogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params

  const blog = await blogsQueryRepository.getBlogById(id)

  if (blog) {
    res.send(blog)
  } else {
    res.sendStatus(404)
  }
})

blogsRouter.get('/:blogId/posts',
  query('pageNumber').customSanitizer(toNumberOrUndefined),
  query('pageSize').customSanitizer(toNumberOrUndefined),
  query('sortDirection').customSanitizer(sortDirectionValueOrUndefined),
  async (req: RequestWithParamsAndQuery<{ blogId: string }, {
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: SortDirection
  }>, res: Response) => {
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
  body('name').trim().notEmpty().isLength({max: 15}),
  body('description').trim().notEmpty().isLength({max: 500}),
  body('websiteUrl').trim().notEmpty().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$').withMessage('Incorrect websiteUrl field'),
  async (req: RequestWithBody<{ name: string, description: string, websiteUrl: string }>, res: Response) => {
    const {name, description, websiteUrl} = req.body

    /// -> to middleware
    const errors = errorsValidation(req, res)
    if(errors?.errorsMessages?.length){
      res.status(400).send(errors)
      return
    }

    const newBlog = await blogsService.createBlog(name, description, websiteUrl)

    res.status(201).send(newBlog)
  })

blogsRouter.post('/:blogId/posts',
  BasicAuthMiddleware,
  body('title').trim().notEmpty().isLength({max: 30}),
  body('shortDescription').trim().notEmpty().isLength({max: 100}),
  body('content').trim().notEmpty().isLength({max: 1000}),
  async (req: RequestWithParamsAndBody<{ blogId: string }, {
    title: string,
    shortDescription: string,
    content: string
  }>, res: Response) => {
    const {blogId} = req.params
    const {title, shortDescription, content} = req.body
    const isBlogExist = await blogsQueryRepository.getBlogById(blogId)

    const errors = errorsValidation(req, res)
    if(errors?.errorsMessages?.length){
      res.status(400).send(errors)
      return
    }

    if (!isBlogExist) {
      res.sendStatus(404)
      return
    }

    const newBlogPost = await blogsService.createBlogPost(title, shortDescription, content, blogId)
    res.status(201).send(newBlogPost)

  })

blogsRouter.put('/:id',
  BasicAuthMiddleware,
  body('name').trim().notEmpty().isLength({max: 15}),
  body('description').trim().notEmpty().isLength({max: 500}),
  body('websiteUrl').trim().notEmpty().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$').withMessage('Incorrect websiteUrl field'),
  async (req: RequestWithParamsAndBody<{ id: string }, {
    name: string,
    description: string,
    websiteUrl: string
  }>, res: Response) => {
    const {id} = req.params
    const {name, description, websiteUrl} = req.body

    const errors = errorsValidation(req, res)
    if(errors?.errorsMessages?.length){
      res.status(400).send(errors)
      return
    }

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
