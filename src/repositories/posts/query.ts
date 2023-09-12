import {DeleteResult, FindOptions, UpdateResult} from "mongodb";
import {blogsCollection, postsCollection} from "../../db/db";
import {blogsDb, postsDb} from "../../db/mock_data";
import {IPost} from "../../interfaces";
import {blogsRepository} from "../blogs";
import { v4 as uuidv4 } from 'uuid';

export const postsQueryRepository = {
  async getPostById(id: string): Promise<IPost | null> {
    return postsCollection.findOne({id}, {projection: {_id: 0}})
  },
  async getAllPostsCount(filterOptions: any): Promise<number> {
    return postsCollection.countDocuments(filterOptions)
  },


}
