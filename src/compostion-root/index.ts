import {BlogsRepository} from "../repositories/blogs";
import {BlogsQueryRepository} from "../repositories/blogs/query";
import {CommentsRepository} from "../repositories/comments";
import {CommentsQueryRepository} from "../repositories/comments/query";
import {PostsRepository} from "../repositories/posts";
import {PostsQueryRepository} from "../repositories/posts/query";
import {UsersRepository} from "../repositories/users";
import {UsersQueryRepository} from "../repositories/users/query";
import {BlogsController} from "../routes/blogs.router";
import {CommentsController} from "../routes/comments.router";
import {PostsController} from "../routes/posts.router";
import {UsersController} from "../routes/users.router";
import {BlogsService} from "../services/blogs.service";
import {CommentsService} from "../services/comments.service";
import {PostsService} from "../services/posts.service";
import {UsersService} from "../services/users.service";

// REPOSITORY
const usersRepository = new UsersRepository()
const usersQueryRepository = new UsersQueryRepository()
const postsRepository = new PostsRepository()
const postsQueryRepository = new PostsQueryRepository()
const blogsRepository = new BlogsRepository()
const blogsQueryRepository = new BlogsQueryRepository()
const commentsRepository = new CommentsRepository()
const commentsQueryRepository = new CommentsQueryRepository()

// SERVICE
const usersService = new UsersService(usersRepository, usersQueryRepository)
const postsService = new PostsService(postsRepository, postsQueryRepository, blogsQueryRepository)
const blogsService = new BlogsService(blogsRepository, blogsQueryRepository, postsQueryRepository)
const commentsService = new CommentsService(commentsRepository, commentsQueryRepository)

// CONTROLLER
export const usersController = new UsersController(usersService, usersQueryRepository)
export const postsController = new PostsController(postsService, commentsService, usersQueryRepository, postsQueryRepository)
export const blogsController = new BlogsController(blogsService, blogsQueryRepository)
export const commentsController = new CommentsController(commentsService, usersQueryRepository, commentsQueryRepository)
