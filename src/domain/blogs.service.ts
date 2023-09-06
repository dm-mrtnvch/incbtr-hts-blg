import {v4 as uuidv4} from "uuid";
import {blogsCollection} from "../db/db";
import {IBlog} from "../interfaces";
import {blogsRepository} from "../repositories/blogs";

export const blogsService = {
  getAllBlogs() {
    return blogsRepository.getAllBlogs()
  },
  getBlogById(id: string): Promise<IBlog | null>{
    return blogsRepository.getBlogById(id)
  },



  async createBlog(name: string, description: string, websiteUrl: string) {
    const newBlog: any = {
      id: uuidv4(),
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false
    }
    // insertOne mutates the object
    return blogsRepository.createBlog({...newBlog})

  },
}
