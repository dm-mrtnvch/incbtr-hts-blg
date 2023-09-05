import {raw, Request, Response, Router} from "express";
import {body, param, validationResult} from "express-validator";
import {ObjectId, UUID} from "mongodb";
import {updateOutput} from "ts-jest/dist/legacy/compiler/compiler-utils";
import {IPost, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../interfaces";
import {AuthMiddleware} from "../../middlewares/middlewares";
import {blogsRepository} from "../../repositories/blogs";
import {postsRepository} from "../../repositories/posts";


export const postsRouter = Router()

postsRouter.get('/', async (req: Request, res: Response) => {
  const posts = await postsRepository.getAllPosts()
  res.send(posts)
})

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const post = await postsRepository.getPostById(id)

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
  body('blogId').trim().notEmpty().custom(async (blogId, { req }) => {
    const blog = await blogsRepository.getBlogById(blogId);
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

    const errors = validationResult(req).array({onlyFirstError: true})

    if (errors.length) {
      const errorsMessages: any = []
      errors.forEach((error: any) => {
        errorsMessages.push({
          message: error.msg,
          field: error.path
        })
      })
      console.log('eee', {errorsMessages})
      res.status(400).send({errorsMessages})
      return
    }

    const newPost = await postsRepository.createPost(title, shortDescription, content, blogId)
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
  body('blogId').trim().notEmpty().custom(async (blogId, { req }) => {
    const blog = await blogsRepository.getBlogById(blogId);
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

    /// is it repository logic to check post?
    const post = await postsRepository.getPostById(id)

    if (!post) {
      res.sendStatus(404)
      return
    }

    const errors = validationResult(req).array({onlyFirstError: true})

    if (errors.length) {
      const errorsMessages: any = []
      errors.forEach((error: any) => {
        errorsMessages.push({
          message: error.msg,
          field: error.path
        })
      })
      console.log('errorsMessages', errorsMessages)
      res.status(400).send({errorsMessages})
      return
    }

    const isUpdated = await postsRepository.updatePostById(id, title, shortDescription, content, blogId)
    if (isUpdated) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })

postsRouter.delete('/:id',
  AuthMiddleware,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {
  const {id} = req.params
  const isPostDeleted = await postsRepository.deletePostById(id)

  if (isPostDeleted) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
})
