import {Router} from "express";
import {body} from "express-validator";
import {CommentsController} from "../controllers/comments.controller";
import {LIKE_STATUS_ENUM} from "../interfaces";
import {container} from "../inversify/inversify.config";
import {
  AccessTokenAuthMiddleware,
  LightAccessTokenAuthMiddleware,
  RequestErrorsValidationMiddleware
} from "../middlewares/middlewares";

const commentsController = container.resolve(CommentsController)
export const commentsRouter = Router()

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

