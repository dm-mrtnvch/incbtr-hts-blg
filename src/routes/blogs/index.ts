import {NextFunction, Request, Response, Router} from "express"
import {body, checkSchema, query, Result, validationResult} from "express-validator";
import {ValidationError} from "express-validator/src/base";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../interfaces";
import {AuthMiddleware, blogsValidationMiddleware} from "../../middlewares/middlewares";
import {blogsRepository} from "../../repositories/blogs";


export const BlogsRouter = Router()

BlogsRouter.get('/', (req: Request, res: Response) => {
  const blogs = blogsRepository.getAllBlogs()
  res.send(blogs)
})

BlogsRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const blog = blogsRepository.getBlogById(id)

  if (blog) {
    res.send(blog)
  } else {
    res.sendStatus(404)
  }
})


BlogsRouter.post('/',
  // trim before or after notEmpty
  AuthMiddleware,
  body('name').trim().notEmpty().isLength({max: 15}),
  body('description').trim().notEmpty().isLength({max: 500}),
  // is notEmpty() necessary if use isLength() ?
  body('websiteUrl').trim().notEmpty().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$').withMessage('Incorrect websiteUrl field'),
  (req: RequestWithBody<{ name: string, description: string, websiteUrl: string }>, res: Response) => {
    const {name, description, websiteUrl} = req.body

    // if add .array({onlyFirstError: true}) => no formatter in response
    const validation = validationResult(req).array({onlyFirstError: true})

    // why validation.isEmpty (not validation.errors.isEmpty)
    // !validation.errors.isEmpty() = TS2341: Property 'errors' is private and only accessible within class 'Result '.
    // types for errorsMessages ?

    if (validation.length) {
      const errorsMessages: any = []
      validation.forEach(error => {
        errorsMessages.push({
          field: error.path,
          message: error.msg
        })
      })

      res.status(400).send({errorsMessages})
      return
    }

    const newBlog = blogsRepository.createBlog(name, description, websiteUrl)
    res.status(201).send(newBlog)
  })

BlogsRouter.put('/:id',
  AuthMiddleware,
  body('name').trim().notEmpty().isLength({max: 15}),
  body('description').trim().notEmpty().isLength({max: 500}),
  body('websiteUrl').trim().notEmpty().isLength({max: 100}).matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$').withMessage('Incorrect websiteUrl field'),
  (req: RequestWithParamsAndBody<{ id: string }, {
    name: string,
    description: string,
    websiteUrl: string
  }>, res: Response) => {
    const {id} = req.params
    const {name, description, websiteUrl} = req.body

    const validation = validationResult(req).array({onlyFirstError: true})

    if(validation.length){
      const errorsMessages = []
      validation.forEach(error => {
        errorsMessages.push({
          field: error.path,
          message: error.msg
        })
      })

      res.status(400).send({errorsMessages})
      return
    }

    const isBlogUpdated = blogsRepository.updateBlogById(id, name, description, websiteUrl)

    if (isBlogUpdated) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })

BlogsRouter.delete('/:id',
  AuthMiddleware,
  (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params

  const isBlogDeleted = blogsRepository.deleteBlogById(id)

  if (isBlogDeleted) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
})
