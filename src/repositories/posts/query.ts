import {DeleteResult, FindOptions, UpdateResult} from "mongodb";

import {BlogModel, PostModel} from "../../db/models";
import {IPost} from "../../interfaces";
import {blogsRepository} from "../blogs";
import { v4 as uuidv4 } from 'uuid';

export const postsQueryRepository = {
  async getPostById(id: string): Promise<IPost | null> {
    return PostModel.findOne({id}, {projection: {_id: 0, __v: 0}})
  },
  async getAllPostsCount(filterOptions: any): Promise<number> {
    return PostModel.countDocuments(filterOptions)
  },


}
