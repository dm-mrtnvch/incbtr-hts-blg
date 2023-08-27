import {Request, Response, Router} from "express";
import {RequestWithParams} from "../../interfaces";
import {postsRepository} from "../../repositories/posts";


export const postsRouter = Router()

postsRouter.get('/', (req: Request, res: Response) => {
  const posts = postsRepository.getAllPosts()
  res.send(posts)
})

postsRouter.get(':/id', (req: RequestWithParams<{id: string}>, res: Response) => {
  const {id} = req.params
  const post = postsRepository.getPostById(id)

  if(post){
    res.send(post)
  } else {
    res.sendStatus(404)
  }
})

postsRouter.delete('/:id', (req: RequestWithParams<{id: string}>, res: Response) => {
  const {id} = req.params
  const isPostDeleted = postsRepository.deletePostById(id)

  if(isPostDeleted){
    res.sendStatus(204)
  } else {
    res.sendStatus(404)
  }
})
