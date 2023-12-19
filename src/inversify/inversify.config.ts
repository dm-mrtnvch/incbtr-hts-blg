import {EmailAdapter} from "../adapters/emailAdapter";
import {JwtService} from "../application/jwt/jwt.service";
import {AuthController} from "../controllers/auth.controller";
import {BlogsController} from "../controllers/blogs.controller";
import {CommentsController} from "../controllers/comments.controller";
import {PostsController} from "../controllers/posts.controller";
import {SecurityController} from "../controllers/security.controller";
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
import { Container } from "inversify";

export const container = new Container()

// ADAPTER
container.bind(EmailAdapter).to(EmailAdapter)

// REPOSITORY
container.bind(BlogsRepository).to(BlogsRepository)
container.bind(BlogsQueryRepository).to(BlogsQueryRepository)
container.bind(CommentsRepository).to(CommentsRepository)
container.bind(CommentsQueryRepository).to(CommentsQueryRepository)
container.bind(PostsRepository).to(PostsRepository)
container.bind(PostsQueryRepository).to(PostsQueryRepository)
container.bind(RequestsRepository).to(RequestsRepository)
container.bind(SecurityRepository).to(SecurityRepository)
container.bind(SecurityQueryRepository).to(SecurityQueryRepository)
container.bind(UsersRepository).to(UsersRepository)
container.bind(UsersQueryRepository).to(UsersQueryRepository)

// SERVICE
container.bind(AuthService).to(AuthService)
container.bind(JwtService).to(JwtService)
container.bind(BlogsService).to(BlogsService)
container.bind(CommentsService).to(CommentsService)
container.bind(PostsService).to(PostsService)
container.bind(RequestsService).to(RequestsService)
container.bind(SecurityService).to(SecurityService)
container.bind(UsersService).to(UsersService)

// CONTROLLER
container.bind(AuthController).to(AuthController)
container.bind(BlogsController).to(BlogsController)
container.bind(CommentsController).to(CommentsController)
container.bind(PostsController).to(PostsController)
container.bind(SecurityController).to(SecurityController)
container.bind(UsersController).to(UsersController)
