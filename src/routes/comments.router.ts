import {Response, Router} from "express";
import {body} from "express-validator";
import {errorsValidation} from "../helpers/utils";
import {RequestWithParams, RequestWithParamsAndBody} from "../interfaces";
import {AccessTokenAuthMiddleware} from "../middlewares/middlewares";
import {commentsQueryRepository} from "../repositories/comments/query";
import {commentsService} from "../services/comments.service";

export const commentsRouter = Router()


commentsRouter.get('/:id',
  async (req: RequestWithParams<{ id: string }>, res: Response) => {

    const {id} = req.params

    const comment = await commentsQueryRepository.getCommentById(id)

    if (!comment) {
      res.sendStatus(404)
      return
    } else {
      res.send(comment)
    }
  })

commentsRouter.put('/:id',
  AccessTokenAuthMiddleware,
  body('content').notEmpty().trim().isLength({min: 20, max: 300}),
  async (req: RequestWithParamsAndBody<{ id: string }, { content: string }>, res: Response) => {
    const {id} = req.params
    const {content} = req.body

    const errors = errorsValidation(req, res)
    if(errors?.errorsMessages?.length){
      res.status(400).send(errors)
      return
    }

    const comment = await commentsQueryRepository.getCommentById(id)

    if(!comment) {
      res.sendStatus(404)
      return
    }
    /// TS18048: 'comment.commentatorInfo' is possibly 'undefined' if without ?
    if(comment.commentatorInfo?.userId !== req.userId) {
      res.sendStatus(403)
      return
    }

    /// will return 404 if we try to update with the same content 2 times
    const isUpdated = await commentsService.updatedCommentById(id, content)

    if(isUpdated){
      res.sendStatus(204)
      return
    } else {
      /// we made check for 404 earlier
      res.sendStatus(404)
      return
    }

  })

commentsRouter.delete('/:commentId',
  AccessTokenAuthMiddleware,
  async (req: RequestWithParams<{ commentId: string }>, res: Response) => {
    const {commentId} = req.params

    /// isOwner
    const comment = await commentsQueryRepository.getCommentById(commentId)

    if (!comment) {
      res.sendStatus(404)
      return
    }

    /// is chaining necessary here?
    if (comment.commentatorInfo.userId !== req.userId) {
      res.sendStatus(403)
      return
    }

    const isDeleted: boolean = await commentsService.deleteCommentById(commentId)

    if (isDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  })
