import {Filter, FindOptions} from "mongodb";
import {v4 as uuidv4} from 'uuid';
import {blogsCollection, postsCollection} from "../../db/db";
import {IBlog, IPost} from "../../interfaces";
import {postsRepository} from "../posts";

export const blogsQueryRepository = {
  async getAllBlogsCount(filterOptions: any): Promise<number> {
    return blogsCollection.countDocuments(filterOptions)
  },

  async getBlogById(id: string): Promise<IBlog | null> {
    return blogsCollection.findOne({id}, {projection: {_id: 0}})
  }
  // getBlogPostsById has logic. can't put it here

}
