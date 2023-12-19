import {Router} from "express";
import {body, param, query} from "express-validator";
import {UUID} from "mongodb";
import {PostsController} from "../controllers/posts.controller";
import {sortDirectionValueOrUndefined, toNumberOrUndefined} from "../helpers/utils";
import {LIKE_STATUS_ENUM} from "../interfaces";
import {container} from "../inversify/inversify.config";
import {
  AccessTokenAuthMiddleware,
  BasicAuthMiddleware,
  LightAccessTokenAuthMiddleware,
  RequestErrorsValidationMiddleware
} from "../middlewares/middlewares";
import {BlogsQueryRepository} from "../repositories/blogs/query";

const postsController = container.resolve(PostsController)
const blogsQueryRepository = container.resolve(BlogsQueryRepository)
export const postsRouter = Router()

postsRouter.get('/',
  query('pageNumber').customSanitizer(toNumberOrUndefined),
  query('pageSize').customSanitizer(toNumberOrUndefined),
  query('sortDirection').customSanitizer(sortDirectionValueOrUndefined),
  LightAccessTokenAuthMiddleware,
  postsController.getPosts.bind(postsController)
)

postsRouter.get('/:id',
  LightAccessTokenAuthMiddleware,
  postsController.getPost.bind(postsController)
)

postsRouter.post('/',
  BasicAuthMiddleware,
  body('title').trim().notEmpty().isLength({max: 30}),
  body('shortDescription').trim().notEmpty().isLength({max: 100}),
  body('content').trim().notEmpty().isLength({max: 1000}),
  body('blogId').trim().notEmpty().custom(async (blogId) => {
    const blog = await blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
  }).withMessage('Specified blog does not exist.'),
  param('blogId').customSanitizer(value => new UUID(value)),
  RequestErrorsValidationMiddleware,
  postsController.createPost.bind(postsController)
)

postsRouter.put('/:id',
  BasicAuthMiddleware,
  body('title').trim().notEmpty().isLength({max: 30}),
  body('shortDescription').trim().notEmpty().isLength({max: 100}),
  body('content').trim().notEmpty().isLength({max: 1000}),
  body('blogId').trim().notEmpty().custom(async (blogId, {req}) => {
    const blog = await blogsQueryRepository.getBlogById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
  }).withMessage('Specified blog does not exist.'),
  RequestErrorsValidationMiddleware,
  postsController.updatePost.bind(postsController)
)

postsRouter.put('/:id/like-status',
  AccessTokenAuthMiddleware,
  LightAccessTokenAuthMiddleware,
  body('likeStatus').notEmpty().trim().custom((likeStatus) => {
    return Object.values(LIKE_STATUS_ENUM).includes(likeStatus)
  }),
  RequestErrorsValidationMiddleware,
  postsController.likePost.bind(postsController)
)

postsRouter.delete('/:id',
  BasicAuthMiddleware,
  postsController.deletePost.bind(postsController)
)

postsRouter.post('/:postId/comments',
  AccessTokenAuthMiddleware,
  RequestErrorsValidationMiddleware,
  body('content').notEmpty().trim().isLength({min: 20, max: 300}),
  postsController.createComment.bind(postsController)
)

postsRouter.get('/:postId/comments',
  query('pageNumber').customSanitizer(toNumberOrUndefined),
  query('pageSize').customSanitizer(toNumberOrUndefined),
  query('sortDirection').customSanitizer(sortDirectionValueOrUndefined),
  LightAccessTokenAuthMiddleware,
  postsController.getComments.bind(postsController)
)
