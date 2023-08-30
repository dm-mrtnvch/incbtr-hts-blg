import {blogsDb} from "../../db/mock_data";
import {IBlog} from "../../interfaces";


export const blogsRepository = {
  getAllBlogs() {
    return blogsDb
  },
  getBlogById(id: string): IBlog | undefined {
    return blogsDb.find(blog => blog.id === id)
  },
  createBlog(name: string, description: string, websiteUrl: string){
    const id = String(+new Date())
    const newBlog: IBlog = {
      id,
      name,
      description,
      websiteUrl
    }

    blogsDb.push(newBlog)
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
