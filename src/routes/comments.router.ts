import {Response, Router} from "express";
import {body} from "express-validator";
import {CommentModel} from "../db/models";
import {LIKE_STATUS_ENUM, RequestWithParams, RequestWithParamsAndBody} from "../interfaces";
import {
  AccessTokenAuthMiddleware,
  LightAccessTokenAuthMiddleware,
  RequestErrorsValidationMiddleware
} from "../middlewares/middlewares";
import {CommentsQueryRepository} from "../repositories/comments/query";
import {UsersQueryRepository} from "../repositories/users/query";
import {CommentsService} from "../services/comments.service";

export const commentsRouter = Router()

class CommentsController {
  commentsQueryRepository: CommentsQueryRepository
  commentsService: CommentsService
  usersQueryRepository: UsersQueryRepository

  constructor() {
    this.commentsQueryRepository = new CommentsQueryRepository()
    this.commentsService = new CommentsService()
    this.usersQueryRepository = new UsersQueryRepository()
  }

  async getComment(req: RequestWithParams<{ id: string }>, res: Response) {
    const {id} = req.params
    const comment = await this.commentsQueryRepository.getCommentByIdAndUserIdIfExist(id, req.userId)

    if (!comment) {
      res.sendStatus(404)
      return
    } else {
      res.send(comment)
    }
  }

  async updateComment(req: RequestWithParamsAndBody<{ id: string }, { content: string }>, res: Response) {
    const {id} = req.params
    const {content} = req.body
    const comment = await this.commentsQueryRepository.getCommentById(id)

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
    const isUpdated = await this.commentsService.updatedCommentById(id, content)

    if (isUpdated) {
      res.sendStatus(204)
      return
    } else {
      /// we made check for 404 earlier
      res.sendStatus(404)
      return
    }
  }

  async likeComment(req: RequestWithParamsAndBody<{ id: string }, { likeStatus: string }>, res: Response) {
    const comment = await CommentModel.findOne({id: req.params.id}).lean()
    const user = await this.usersQueryRepository.getUserById(req.userId)

    if (!comment) {
      res.sendStatus(404)
      return
    }

    const isMyReactionExist = await CommentModel.findOne({
      id: req.params.id,
      'likes.userId': req.userId
    }).lean()

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
      await CommentModel.findOneAndUpdate({id: req.params.id, 'likes.userId': req.userId}, {
        $set: {
          'likes.$.likeStatus': req.body.likeStatus,
        }
      })
      res.sendStatus(204)
      return
    }
  }

  async deleteComment(req: RequestWithParams<{ commentId: string }>, res: Response) {
    const {commentId} = req.params
    /// isOwner
    const comment = await this.commentsQueryRepository.getCommentById(commentId)

    if (!comment) {
      res.sendStatus(404)
      return
    }

    /// is chaining necessary here?
    if (comment.commentatorInfo?.userId !== req.userId) {
      res.sendStatus(403)
      return
    }

    const isDeleted: boolean = await this.commentsService.deleteCommentById(commentId)

    if (isDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  }
}

const commentsController = new CommentsController()

commentsRouter.get('/:id',
  LightAccessTokenAuthMiddleware,
  commentsController.getComment.bind(commentsController)
)

commentsRouter.put('/:id',
  AccessTokenAuthMiddleware,
  body('content').notEmpty().trim().isLength({min: 20, max: 300}),
  RequestErrorsValidationMiddleware,
  commentsController.updateComment.bind(commentsController)
)

commentsRouter.put('/:id/like-status',
  AccessTokenAuthMiddleware,
  body('likeStatus').notEmpty().trim().custom((likeStatus) => {
    return Object.values(LIKE_STATUS_ENUM).includes(likeStatus)
  }),
  RequestErrorsValidationMiddleware,
  commentsController.likeComment.bind(commentsController)
)

commentsRouter.delete('/:commentId',
  AccessTokenAuthMiddleware,
  commentsController.deleteComment.bind(commentsController)
)
