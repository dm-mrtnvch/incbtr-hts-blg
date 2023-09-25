import {BlogModel} from "../../db/db";
import {IBlog} from "../../interfaces";

export const blogsQueryRepository = {
  async getAllBlogsCount(filterOptions: any): Promise<number> {
    return BlogModel.countDocuments(filterOptions)
  },

  async getBlogById(id: string): Promise<IBlog | null> {
    return BlogModel.findOne({id}, {projection: {_id: 0}})
  }
}
