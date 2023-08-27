import {blogsDb, postsDb} from "../../db/mock_data";
import {IPost} from "../../interfaces";

export const postsRepository = {
  getAllPosts(): IPost[] {
    return postsDb
  },
  getPostById(id: string): IPost | undefined {
    return postsDb.find(post => post.id === id)
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
