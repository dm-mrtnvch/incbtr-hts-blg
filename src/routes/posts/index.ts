import {Response, Router} from "express";
import {body, param, query} from "express-validator";
import {SortDirection, UUID} from "mongodb";
import {errorsValidation, sortDirectionValueOrUndefined, toNumberOrUndefined} from "../../helpers/utils";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "../../interfaces";
import {AuthMiddleware} from "../../middlewares/middlewares";
import {blogsQueryRepository} from "../../repositories/blogs/query";
import {postsQueryRepository} from "../../repositories/posts/query";
import {postsService} from "../../services/posts.service";


export const postsRouter = Router()

postsRouter.get('/',
  query('pageNumber').customSanitizer(toNumberOrUndefined),
  query('pageSize').customSanitizer(toNumberOrUndefined),
  query('sortDirection').customSanitizer(sortDirectionValueOrUndefined),
  async (req: RequestWithQuery<{
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: SortDirection
  }>, res: Response) => {
    const {pageNumber, pageSize, sortBy, sortDirection} = req.query

    const posts = await postsService.getAllPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection)
    res.send(posts)
  })

postsRouter.get('/:id',
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const post = await postsQueryRepository.getPostById(id)

  if (post) {
    res.send(post)
  } else {
    res.sendStatus(404)
  }
})

postsRouter.post('/',
  AuthMiddleware,
  body('title').trim().notEmpty().isLength({max: 30}),
  body('shortDescription').trim().notEmpty().isLength({max: 100}),
  body('content').trim().notEmpty().isLength({max: 1000}),
  body('blogId').trim().notEmpty().custom(async (blogId) => {
    const blog = await blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
  }).withMessage('Specified blog does not exist.'),
  param('blogId').customSanitizer(value => new UUID(value)),
  async (req: RequestWithBody<{
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  }>, res: Response) => {
    const {title, shortDescription, content, blogId} = req.body

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const newPost = await postsService.createPost(title, shortDescription, content, blogId)
    if (newPost) {
      res.status(201).send(newPost)
    } else {
      res.sendStatus(400)
    }
  })

postsRouter.put('/:id',
  AuthMiddleware,
  body('title').trim().notEmpty().isLength({max: 30}),
  body('shortDescription').trim().notEmpty().isLength({max: 100}),
  body('content').trim().notEmpty().isLength({max: 1000}),
  body('blogId').trim().notEmpty().custom(async (blogId, {req}) => {
    const blog = await blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
  }).withMessage('Specified blog does not exist.'),

  async (req: RequestWithParamsAndBody<{ id: string }, {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  }>, res: Response) => {
    const {id} = req.params
    const {title, blogId, content, shortDescription} = req.body

    const post = await postsQueryRepository.getPostById(id)

    if (!post) {
      res.sendStatus(404)
      return
    }

    const errors = errorsValidation(req, res)
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const isUpdated = await postsService.updatePostById(id, title, shortDescription, content, blogId)

    if (isUpdated) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })

postsRouter.delete('/:id',
  AuthMiddleware,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    /// it's string not number
    const {id} = req.params
    const isPostDeleted = await postsService.deletePostById(id)

    if (isPostDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
