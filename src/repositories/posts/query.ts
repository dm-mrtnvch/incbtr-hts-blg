import {PostModel} from "../../db/models";
import {IPost} from "../../interfaces";

export class PostsQueryRepository {
  async getPostById(id: string): Promise<IPost | null> {
    return PostModel.findOne({id}, {projection: {_id: 0, __v: 0}})
  }

  async getAllPostsCount(filterOptions: any): Promise<number> {
    return PostModel.countDocuments(filterOptions)
  }
}

export const postsQueryRepository = new PostsQueryRepository()
