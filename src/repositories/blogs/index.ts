import {ObjectId} from "mongodb";
import {blogsCollection} from "../../db/db";
import {blogsDb} from "../../db/mock_data";
import {IBlog} from "../../interfaces";
import { v4 as uuidv4 } from 'uuid';

export const blogsRepository = {
  getAllBlogs() {
    return blogsCollection.find({}).toArray()
    // return blogsDb
  },
  getBlogById(id: string): any{

    return blogsCollection.findOne({id})
    // return blogsDb.find(blog => blog.id === id)
  },
  async createBlog(name: string, description: string, websiteUrl: string) {
    const newBlog: any = {
      id: uuidv4(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: true // is this field for roles in future?
    }

    await blogsCollection.insertOne({...newBlog})

    // res {
    //   acknowledged: true,
    //     insertedId: new ObjectId("64f318ae03642478147e8360")
    // }

    // const {_id, ...newBlogToReturn} = newBlog

    return newBlog
  },
  updateBlogById(id: string, name: string, description: string, websiteUrl: string): boolean {
    const blogToUpdate = blogsDb.find(blog => blog.id === id)

    if(blogToUpdate) {
      const updatedBlog = {
        id,
        name: name ?? blogToUpdate.name,
        description: description ?? blogToUpdate.description ,
        websiteUrl: websiteUrl ?? blogToUpdate.websiteUrl
      }
      Object.assign(blogToUpdate, updatedBlog)

    }
    return Boolean(blogToUpdate)
  },
  deleteBlogById(id: string){
    const blogIndexToDelete = blogsDb.findIndex(blog => blog.id === id)
    const blogLengthBeforeUpdate = blogsDb.length

    if(blogIndexToDelete === -1){
      return false
    } else {
      blogsDb.splice(blogIndexToDelete, 1)
      const blogLengthAfterUpdate = blogsDb.length
      // is it necessary check for deleting
      // or use this check
      // return this.getBlogById(id)

      return blogLengthBeforeUpdate - blogLengthAfterUpdate === 1
    }
  }
}
