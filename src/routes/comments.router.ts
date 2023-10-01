import {Request, Response, Router} from "express";
import {body} from "express-validator";

import {CommentModel} from "../db/models";
import {errorsValidation} from "../helpers/utils";
import {LIKE_STATUS_ENUM, RequestWithParams, RequestWithParamsAndBody} from "../interfaces";
import {
  AccessTokenAuthMiddleware,
  LightAccessTokenAuthMiddleware,
  RequestErrorsValidationMiddleware
} from "../middlewares/middlewares";
import {commentsQueryRepository} from "../repositories/comments/query";
import {usersRepository} from "../repositories/users";
import {usersQueryRepository} from "../repositories/users/query";
import {commentsService} from "../services/comments.service";

export const commentsRouter = Router()


commentsRouter.get('/:id',
  LightAccessTokenAuthMiddleware,
  async (req: RequestWithParams<{ id: string }>, res: Response) => {

    const {id} = req.params
    const comment = await commentsQueryRepository.getCommentByIdAndUserIdIfExist(id, req.userId)

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
    if (errors?.errorsMessages?.length) {
      res.status(400).send(errors)
      return
    }

    const comment = await commentsQueryRepository.getCommentById(id)

    if (!comment) {
      res.sendStatus(404)
      return
    }
    /// TS18048: 'comment.commentatorInfo' is possibly 'undefined' if without ?
    if (comment.commentatorInfo?.userId !== req.userId) {
      res.sendStatus(403)
      return
    }

    /// will return 404 if we try to update with the same content 2 times
    const isUpdated = await commentsService.updatedCommentById(id, content)

    if (isUpdated) {
      res.sendStatus(204)
      return
    } else {
      /// we made check for 404 earlier
      res.sendStatus(404)
      return
    }

  })

commentsRouter.put('/:id/like-status',
  AccessTokenAuthMiddleware,
  body('likeStatus').notEmpty().trim().custom((likeStatus) => {
    return Object.values(LIKE_STATUS_ENUM).includes(likeStatus)
  }),
  RequestErrorsValidationMiddleware,
  async (req: RequestWithParamsAndBody<{ id: string }, { likeStatus: string }>, res: Response) => {
    const comment = await CommentModel.findOne({id: req.params.id}).lean()

    const user = await usersQueryRepository.getUserById(req.userId)

    if (!comment) {
      res.sendStatus(404)
      return
    }

    const isMyReactionExist = await CommentModel.findOne({
      id: req.params.id,
      'likes.userId': req.userId
    }).lean()

    console.log('isMyReactionExist', isMyReactionExist)


    if (!isMyReactionExist && req.body.likeStatus !== LIKE_STATUS_ENUM.NONE) {
      await CommentModel.findOneAndUpdate({id: req.params.id}, {
        $push: {
          'likes': {
            userId: req.userId,
            userName: user.accountData.login,
            likeStatus: req.body.likeStatus
          }
        }
      })
      res.sendStatus(204)
      return
    }


    if (!isMyReactionExist && req.body.likeStatus === LIKE_STATUS_ENUM.NONE) {
      res.sendStatus(204)
      return
    }


    if (isMyReactionExist && (isMyReactionExist?.likes?.find(like => like.userId === req.userId)?.likeStatus === LIKE_STATUS_ENUM.NONE)) {
      await CommentModel.findOneAndUpdate({id: req.params.id}, {
        $pull: {
          likes: {userId: req.userId}
        }
      })

      res.sendStatus(204)
      return
    }

    if (isMyReactionExist) {
      // console.log('isMyReactionExist', isMyReactionExist)
      // const test = await CommentModel.findOne({id: req.params.id, 'likes.userId': req.userId}).lean()
      // console.log('test', test)

      await CommentModel.findOneAndUpdate({id: req.params.id, 'likes.userId': req.userId}, {
        $set: {
          'likes.$.likeStatus': req.body.likeStatus,
        }
      })
      res.sendStatus(204)
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
    if (comment.commentatorInfo?.userId !== req.userId) {
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

commentsRouter.delete('', async (req: Request, res: Response) => {
  await CommentModel.deleteMany({})
  res.sendStatus(204)
})
