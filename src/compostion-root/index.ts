import {EmailAdapter} from "../adapters/emailAdapter";
import {JwtService} from "../application/jwt/jwt.service";
import {AuthController} from "../controllers/auth.controller";
import {SecurityController} from "../controllers/security.controller";
import {BlogsController} from "../controllers/blogs.controller";
import {CommentsController} from "../controllers/comments.controller";
import {PostsController} from "../controllers/posts.controller";
import {UsersController} from "../controllers/users.controller";
import {BlogsRepository} from "../repositories/blogs";
import {BlogsQueryRepository} from "../repositories/blogs/query";
import {CommentsRepository} from "../repositories/comments";
import {CommentsQueryRepository} from "../repositories/comments/query";
import {PostsRepository} from "../repositories/posts";
import {PostsQueryRepository} from "../repositories/posts/query";
import {RequestsRepository} from "../repositories/requests";
import {SecurityRepository} from "../repositories/security";
import {SecurityQueryRepository} from "../repositories/security/query";
import {UsersRepository} from "../repositories/users";
import {UsersQueryRepository} from "../repositories/users/query";
import {AuthService} from "../services/auth.service";
import {BlogsService} from "../services/blogs.service";
import {CommentsService} from "../services/comments.service";
import {PostsService} from "../services/posts.service";
import {RequestsService} from "../services/requests.service";
import {SecurityService} from "../services/security.service";
import {UsersService} from "../services/users.service";

// REPOSITORY
// const usersRepository = new UsersRepository()
// export const usersQueryRepository = new UsersQueryRepository()
// const postsRepository = new PostsRepository()
// const postsQueryRepository = new PostsQueryRepository()
// const blogsRepository = new BlogsRepository()
// export const blogsQueryRepository = new BlogsQueryRepository()
// const commentsRepository = new CommentsRepository()
// const commentsQueryRepository = new CommentsQueryRepository()
// const securityRepository = new SecurityRepository()
// const securityQueryRepository = new SecurityQueryRepository()
// const requestsRepository = new RequestsRepository()

// ADAPTER
// const emailAdapter = new EmailAdapter()

// SERVICE
// const usersService = new UsersService(emailAdapter, usersRepository, usersQueryRepository)
// const postsService = new PostsService(postsRepository, postsQueryRepository, blogsQueryRepository)
// const blogsService = new BlogsService(blogsRepository, blogsQueryRepository, postsQueryRepository)
// const commentsService = new CommentsService(commentsRepository, commentsQueryRepository)
// const authService = new AuthService(emailAdapter, usersRepository, usersQueryRepository)
// export const jwtService = new JwtService()
// const securityService = new SecurityService(securityRepository)
// export const requestsService = new RequestsService(requestsRepository)

// CONTROLLER
// export const usersController = new UsersController(usersService, usersQueryRepository)
// export const postsController = new PostsController(postsService, commentsService, usersQueryRepository, postsQueryRepository)
// export const blogsController = new BlogsController(blogsService, blogsQueryRepository)
// export const commentsController = new CommentsController(commentsService, usersQueryRepository, commentsQueryRepository)
// export const authController = new AuthController(
//   authService,
//   jwtService,
//   securityService,
//   usersService,
//   usersRepository,
//   usersQueryRepository,
//   emailAdapter)
// export const securityController = new SecurityController(securityService, securityQueryRepository)
