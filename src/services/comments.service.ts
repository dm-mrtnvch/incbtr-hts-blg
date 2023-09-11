import {v4 as uuidv4} from "uuid";
import {commentsRepository} from "../repositories/comments";
import {usersQueryRepository} from "../repositories/users/query";


export const commentsService = {
  async createComment(content: string, {userId, userLogin}: any, postId: string) {
    const newComment = {
      id: uuidv4(),
      content,
      commentatorInfo: {
        userId,
        userLogin
      },
      createdAt: new Date().toISOString(),
      postId
    }

    return await commentsRepository.createComment(newComment)

  }
}
