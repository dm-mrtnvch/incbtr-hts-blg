import {Router} from "express"
import {checkSchema} from "express-validator";
import {BlogsController} from "../controllers/blogs.controller";
import {container} from "../inversify/inversify.config";
import {
  BasicAuthMiddleware,
  LightAccessTokenAuthMiddleware,
  RequestErrorsValidationMiddleware
} from "../middlewares/middlewares";
import {blogCreateUpdateValidationSchema, paginationSanitizationSchema, postValidationSchema} from "../validation/auth";

const blogsController = container.resolve(BlogsController)
export const blogsRouter = Router()

blogsRouter.get('/',
  checkSchema(paginationSanitizationSchema),
  blogsController.getBlogs.bind(blogsController)
)

blogsRouter.get('/:id',
  blogsController.getBlog.bind(blogsController)
)

blogsRouter.get('/:blogId/posts',
  checkSchema(paginationSanitizationSchema),
  LightAccessTokenAuthMiddleware,
  blogsController.getPosts.bind(blogsController)
)

blogsRouter.post('/',
  BasicAuthMiddleware,
  checkSchema(blogCreateUpdateValidationSchema),
  RequestErrorsValidationMiddleware,
  blogsController.createBlog.bind(blogsController)
)

blogsRouter.post('/:blogId/posts',
  BasicAuthMiddleware,
  checkSchema(postValidationSchema),
  RequestErrorsValidationMiddleware,
  blogsController.createPost.bind(blogsController)
)

blogsRouter.put('/:id',
  BasicAuthMiddleware,
  checkSchema(blogCreateUpdateValidationSchema),
  RequestErrorsValidationMiddleware,
  blogsController.updateBlog.bind(blogsController)
)

blogsRouter.delete('/:id',
  BasicAuthMiddleware,
  blogsController.deleteBlog.bind(blogsController)
)




