import {blogsDb, postsDb} from "../../db/mock_data";
import {IPost} from "../../interfaces";
import {blogsRepository} from "../blogs";

export const postsRepository = {
  getAllPosts(): IPost[] {
    return postsDb
  },
  getPostById(id: string): IPost | undefined {
    return postsDb.find(post => post.id === id)
  },
  createPost(title: string, shortDescription: string, content: string, blogId: string){
    const blog = blogsRepository.getBlogById(blogId)

    if(blog) {
      const newPost = {
        id: String(+new Date()),
        title,
        content,
        shortDescription,
        blogId,
        blogName: blog.name
      }

      postsDb.push(newPost)
      return newPost
    } else {
      return false
    }
  },
  deletePostById(id: string) {
    const postIndexToDelete = postsDb.findIndex(post => post.id === id)

    if(postIndexToDelete === -1){
      return false
    } else {
      postsDb.splice(postIndexToDelete, 1)
      return true
    }
  }
}
