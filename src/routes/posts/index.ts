import {Request, Response, Router} from "express";
import {body, validationResult} from "express-validator";
import {updateOutput} from "ts-jest/dist/legacy/compiler/compiler-utils";
import {IPost, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../interfaces";
import {AuthMiddleware} from "../../middlewares/middlewares";
import {blogsRepository} from "../../repositories/blogs";
import {postsRepository} from "../../repositories/posts";


export const postsRouter = Router()

postsRouter.get('/', (req: Request, res: Response) => {
  const posts = postsRepository.getAllPosts()
  res.send(posts)
})

postsRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const post = postsRepository.getPostById(id)
  console.log('post', post)
  if (post) {
    res.send(post)
  } else {
    res.sendStatus(404)
  }
})

postsRouter.post('/',
  AuthMiddleware,
  body('title').notEmpty().trim().isLength({max: 30}),
  body('shortDescription').notEmpty().trim().isLength({max: 100}),
  body('content').notEmpty().trim().isLength({max: 1000}),
  (req: RequestWithBody<{
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  }>, res: Response) => {
    const {title, shortDescription, content, blogId} = req.body

    const errors = validationResult(req).array({onlyFirstError: true})

    if (errors.length) {
      const errorsMessages: any = []
      errors.forEach((error: any) => {
        errorsMessages.push({
          message: error.msg,
          field: error.path
        })
      })
      res.status(400).send({errorsMessages})
      return
    }

    const newPost = postsRepository.createPost(title, shortDescription, content, blogId)
    if (newPost) {
      res.status(201).send(newPost)
    } else {
      res.sendStatus(400)
    }
  })

postsRouter.put('/:id',
  AuthMiddleware,
  body('title').notEmpty().trim().isLength({max: 30}),
  body('shortDescription').notEmpty().trim().isLength({max: 100}),
  body('content').notEmpty().trim().isLength({max: 1000}),
  (req: RequestWithParamsAndBody<{ id: string }, {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  }>, res: Response) => {
    const {id} = req.params
    const {title, blogId, content, shortDescription} = req.body
    const post = postsRepository.getPostById(id)

    const errors = validationResult(req).array({onlyFirstError: true})

    if (errors.length) {
      const errorsMessages: any = []
      errors.forEach((error: any) => {
        errorsMessages.push({
          message: error.msg,
          field: error.path
        })
      })
      res.status(400).send({errorsMessages})
      return
    }

    if (!post) {
      res.sendStatus(404)
      return
    }

    const updatedPost: IPost = {
      id: post.id,
      title,
      blogId,
      content,
      shortDescription,
      blogName: post.blogName
    }
    Object.assign(post, updatedPost)

    res.sendStatus(204)
  })

postsRouter.delete('/:id', (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const isPostDeleted = postsRepository.deletePostById(id)

  if (isPostDeleted) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
})
