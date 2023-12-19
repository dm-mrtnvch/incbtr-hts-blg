import {Response} from "express";
import {inject, injectable} from "inversify";
import {SortDirection} from "mongodb";
import {PostModel} from "../db/models";
import {
  LIKE_STATUS_ENUM,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery
} from "../interfaces";
import {PostsQueryRepository} from "../repositories/posts/query";
import {UsersQueryRepository} from "../repositories/users/query";
import {CommentsService} from "../services/comments.service";
import {PostsService} from "../services/posts.service";

@injectable()
export class PostsController {
  constructor(
    @inject(PostsService) private postsService: PostsService,
    @inject(CommentsService) private commentsService: CommentsService,
    @inject(UsersQueryRepository) private usersQueryRepository: UsersQueryRepository,
    @inject(PostsQueryRepository) private postsQueryRepository: PostsQueryRepository
  ) {
  }

  async getPosts(req: RequestWithQuery<{
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: SortDirection
  }>, res: Response) {
    const {pageNumber, pageSize, sortBy, sortDirection} = req.query

    const posts = await this.postsService.getAllPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      req.userId)

    res.send(posts)
  }

  async getPost(req: RequestWithParams<{ id: string }>, res: Response) {
    const {id} = req.params
    console.log('req', req.userId)
    const post = await this.postsQueryRepository.getPostByIdAndUserId(id, req.userId)
    if (post) {
      res.send(post)
    } else {
      res.sendStatus(404)
    }
  }

  async createPost(req: RequestWithBody<{
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  }>, res: Response) {
    const {title, shortDescription, content, blogId} = req.body
    const newPost = await this.postsService.createPost(title, shortDescription, content, blogId)

    if (newPost) {
      res.status(201).send(newPost)
    } else {
      res.sendStatus(400)
    }
  }

  async updatePost(req: RequestWithParamsAndBody<{ id: string }, {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  }>, res: Response) {
    const {id} = req.params
    const {title, blogId, content, shortDescription} = req.body
    const post = await this.postsQueryRepository.getPostById(id)

    if (!post) {
      res.sendStatus(404)
      return
    }

    const isUpdated = await this.postsService.updatePostById(id, title, shortDescription, content, blogId)

    if (isUpdated) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  }

  async likePost(req: RequestWithParamsAndBody<{ id: string }, { likeStatus: string }>, res: Response) {
    const isPostExist = await this.postsQueryRepository.getPostById(req.params.id)
    const user = await this.usersQueryRepository.getUserById(req.userId)

    if (!isPostExist) {
      res.sendStatus(404)
      return
    }

    const isMyReactionExist = await PostModel.findOne({
      id: req.params.id,
      'likes.userId': req.userId
    }).lean() as any

    console.log('is', isMyReactionExist)


    if (!isMyReactionExist && req.body.likeStatus !== LIKE_STATUS_ENUM.NONE) {
      await PostModel.findOneAndUpdate({id: req.params.id}, {
        $push: {
          'likes': {
            userId: req.userId,
            login: user.accountData.login,
            likeStatus: req.body.likeStatus,
            createdAt: new Date().toISOString()
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

    if (isMyReactionExist && (isMyReactionExist?.likes?.find((like: any) => like.userId === req.userId)?.likeStatus === LIKE_STATUS_ENUM.NONE)) {
      await PostModel.findOneAndUpdate({id: req.params.id}, {
        $pull: {
          likes: {userId: req.userId}
        }
      })

      res.sendStatus(204)
      return
    }

    if (isMyReactionExist) {
      await PostModel.findOneAndUpdate({id: req.params.id, 'likes.userId': req.userId}, {
        $set: {
          'likes.$.likeStatus': req.body.likeStatus,
        }
      })
      res.sendStatus(204)
      return
    }


  }

  async deletePost(req: RequestWithParams<{ id: string }>, res: Response) {
    const {id} = req.params
    const isPostDeleted = await this.postsService.deletePostById(id)

    if (isPostDeleted) {
      res.sendStatus(204)
    } else {
      res.sendStatus(404)
    }
  }

  async createComment(req: RequestWithParamsAndBody<{ postId: string }, { content: string }>, res: Response) {
    const {postId} = req.params
    const {content} = req.body
    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      res.sendStatus(404)
      return
    }

    if (req.userId) {
      const user = await this.usersQueryRepository.getUserById(req.userId)

      if (user) {
        // send as object when 4 params?
        const newComment = await this.commentsService.createComment(content, user.id, user?.accountData?.login, postId)
        res.status(201).send(newComment)
        return
      }
    } else {
      res.sendStatus(401)
    }
  }

  async getComments(req: RequestWithParamsAndQuery<
    { postId: string },
    {
      pageNumber?: number,
      pageSize?: number,
      sortBy?: string,
      sortDirection?: SortDirection
    }>, res: Response) {
    const {postId} = req.params
    const {pageNumber, pageSize, sortBy, sortDirection} = req.query
    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      res.sendStatus(404)
      return
    }

    const comments = await this.commentsService.getCommentsByPostId(postId, pageNumber, pageSize, sortBy, sortDirection, req.userId)

    res.send(comments)
  }
}
