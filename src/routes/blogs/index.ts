import {Request, Response, Router} from "express"
import {body, validationResult} from "express-validator";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../interfaces";
import {AuthMiddleware} from "../../middlewares/middlewares";
import {blogsRepository} from "../../repositories/blogs";


export const BlogsRouter = Router()

BlogsRouter.get('/', async (req: Request, res: Response) => {
  const blogs = await blogsRepository.getAllBlogs()
  res.send(blogs)
})

BlogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const blog = await blogsRepository.getBlogById(id)

  if (blog) {
    res.send(blog)
  } else {
    res.sendStatus(404)
  }
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

    const newBlog = await blogsRepository.createBlog(name, description, websiteUrl)

    res.status(201).send(newBlog)
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

    const isBlogUpdated = await blogsRepository.updateBlogById(id, name, description, websiteUrl)

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

    const isBlogDeleted = await blogsRepository.deleteBlogById(id)

    if (isBlogDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
