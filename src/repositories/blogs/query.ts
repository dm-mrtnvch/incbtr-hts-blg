import {BlogModel} from "../../db/models";
import {IBlog} from "../../interfaces";

export class BlogsQueryRepository {
  async getAllBlogsCount(filterOptions: any): Promise<number> {
    return BlogModel.countDocuments(filterOptions)
  }

  async getBlogById(id: string): Promise<IBlog | null> {
    return BlogModel.findOne({id}, {projection: {_id: 0}})
  }
}

export const blogsQueryRepository = new BlogsQueryRepository()
