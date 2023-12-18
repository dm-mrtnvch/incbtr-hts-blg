import {BlogsRepository} from "../repositories/blogs";
import {BlogsQueryRepository} from "../repositories/blogs/query";
import {PostsQueryRepository} from "../repositories/posts/query";
import {UsersRepository} from "../repositories/users";
import {UsersQueryRepository} from "../repositories/users/query";
import {BlogsController} from "../routes/blogs.router";
import {UsersController} from "../routes/users.router";
import {BlogsService} from "../services/blogs.service";
import {UsersService} from "../services/users.service";


// users
const usersRepository = new UsersRepository()
const usersQueryRepository = new UsersQueryRepository()
const usersService = new UsersService(usersRepository, usersQueryRepository)
export const usersController = new UsersController(usersService, usersQueryRepository)

// posts
const postsQueryRepository = new PostsQueryRepository()

// blogs
const blogsRepository = new BlogsRepository()
const blogsQueryRepository = new BlogsQueryRepository()
const blogsService = new BlogsService(blogsRepository, blogsQueryRepository, postsQueryRepository)
export const blogsController = new BlogsController(blogsService, blogsQueryRepository)


