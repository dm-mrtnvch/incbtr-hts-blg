import {raw, Request, Response, Router} from "express"
import {body, validationResult} from "express-validator";
import {blogsCollection} from "../../db/db";
import {blogsService} from "../../domain/blogs.service";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery
} from "../../interfaces";
import {AuthMiddleware} from "../../middlewares/middlewares";
import {blogsRepository} from "../../repositories/blogs";


export const BlogsRouter = Router()

BlogsRouter.get('/', async (req: Request, res: Response) => {
  const blogs = await blogsService.getAllBlogs()
  res.send(blogs)
})

BlogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const blog = await blogsService.getBlogById(id)

  if (blog) {
    res.send(blog)
  } else {
    res.sendStatus(404)
  }
})

BlogsRouter.get('/:blogId/posts',
  async (req: RequestWithParamsAndQuery<{blogId: string}, {
    pageNumber: string, pageSize: string, sortBy: string, sortDirection: string
  }>, res: Response) => {
    const { blogId } = req.params
    const { pageNumber, pageSize, sortBy, sortDirection } = req.query

    // is it possible to trigger repository layer from router
    const isBlogExist = await blogsCollection.findOne({id: blogId})
    if (!isBlogExist) {
      res.sendStatus(404)
      return
    }

    const blogPosts = await blogsService.getBlogPostsById(
      blogId,
      Number(pageNumber) || undefined,
      Number(pageSize) || undefined,
      sortBy,
      sortDirection,
    )
    res.send(blogPosts)
  })

BlogsRouter.post('/',
  AuthMiddleware,
  body('name').trim().notEmpty().isLength({max: 15}),
  body('description').trim().notEmpty().isLength({max: 500}),
  body('websiteUrl').trim().notEmpty().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$').withMessage('Incorrect websiteUrl field'),
  async (req: RequestWithBody<{ name: string, description: string, websiteUrl: string }>, res: Response) => {
    const {name, description, websiteUrl} = req.body

    const validation = validationResult(req).array({onlyFirstError: true})

    if (validation.length) {
      const errorsMessages: any = []
      validation.forEach((error: any) => {
        errorsMessages.push({
          field: error.path,
          message: error.msg
        })
      })

      res.status(400).send({errorsMessages})
      return
    }

    const newBlog = await blogsService.createBlog(name, description, websiteUrl)

    res.status(201).send(newBlog)
  })

BlogsRouter.post('/:blogId/posts',
  AuthMiddleware,
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
    const isBlogExist = await blogsRepository.getBlogById(blogId)

    const validation = validationResult(req).array({onlyFirstError: true})

    if (validation.length) {
      const errorsMessages: any = []
      validation.forEach((error: any) => {
        errorsMessages.push({
          field: error.path,
          message: error.msg
        })
      })

      res.status(400).send({errorsMessages})
      return
    }

    if (!isBlogExist) {
      res.sendStatus(404)
      return
    }

    const newBlogPost = await blogsService.createBlogPost(title, shortDescription, content, blogId)
    res.status(201).send(newBlogPost)

  })

BlogsRouter.put('/:id',
  AuthMiddleware,
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

    const validation = validationResult(req).array({onlyFirstError: true})

    if (validation.length) {
      const errorsMessages: any = []
      validation.forEach((error: any) => {
        errorsMessages.push({
          field: error.path,
          message: error.msg
        })
      })

      res.status(400).send({errorsMessages})
      return
    }

    const isBlogUpdated = await blogsService.updateBlogById(id, name, description, websiteUrl)

    if (isBlogUpdated) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })

BlogsRouter.delete('/:id',
  AuthMiddleware,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const {id} = req.params

    const isBlogDeleted = await blogsService.deleteBlogById(id)

    if (isBlogDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
