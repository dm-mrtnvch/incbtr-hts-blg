import {NextFunction, Request, Response, Router} from "express"
import {body, query, validationResult} from "express-validator";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../interfaces";
import {blogsRepository} from "../../repositories/blogs";


export const BlogsRouter = Router()

BlogsRouter.get('/', (req: Request, res: Response) => {
  const blogs = blogsRepository.getAllBlogs()
  res.send(blogs)
})

BlogsRouter.get('/:id', (req: RequestWithParams<{id: string}>, res: Response) => {
  const { id } = req.params

  const blog = blogsRepository.getBlogById(id)

  if (blog){
    res.send(blog)
  } else {
    res.sendStatus(404)
  }
})

const nameValidation = () => body('name').trim().notEmpty()
const createDescriptionChain = () => body('description').trim().notEmpty()
const createWebsiteUrlChain = () => body('websiteUrl')
  .trim()
  .notEmpty()
  .isLength({max: 1000})
  .matches('^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$\n')
  .withMessage('Incorrect websiteUrl field')


const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if(req.query)
  next()
};


const errorsValidation = (req: Request) => {
  console.log('req', req.body)
  const result = validationResult(req)
  if(result.isEmpty()){
    console.log('true')
  } else {
    console.log('false')
  }
}

BlogsRouter.post('/',
  AuthMiddleware,
  nameValidation(),
  createDescriptionChain(),
  createWebsiteUrlChain(),
  errorsValidation,
  (req: RequestWithBody<{name: string, description: string, websiteUrl: string}>, res: Response) => {
  const {name, description, websiteUrl} = req.body
  const result = validationResult(req)


    // if(result.isEmpty()){
    //   const newBlog = blogsRepository.createBlog(name, description, websiteUrl)
    //   res.status(201).send(newBlog)
    // } else {
    //   res.status(400).send(result.array())
    // }



})

BlogsRouter.put('/:id', (req: RequestWithParamsAndBody<{id: string}, {name: string, description: string, websiteUrl: string}>, res: Response) => {
  const {id} = req.params
  const {name, description, websiteUrl} = req.body

  const isBlogUpdated = blogsRepository.updateBlogById(id, name, description, websiteUrl)

  if(isBlogUpdated){
    res.sendStatus(404)
  } else {
    res.sendStatus(204)
  }
})

BlogsRouter.delete('/:id', (req: RequestWithParams<{id: string}>, res: Response) => {
  const {id} = req.params

  const isBlogDeleted = blogsRepository.deleteBlogById(id)

  if(isBlogDeleted) {
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
})
