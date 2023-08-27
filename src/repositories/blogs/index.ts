type BlogType = {
  id: string
  name: string
  description: string
  websiteUrl: string
}


const blogsDb: BlogType[] = [
  {
    id: '1',
    name: 'first blog',
    description: 'first description',
    websiteUrl: 'www.example.com'
  }
]

export const blogsRepository = {
  getAllBlogs() {
    return blogsDb
  },
  getBlogById(id: string) {
    return blogsDb.find(blog => blog.id === id)
  },
  createBlog(name: string, description: string, websiteUrl: string){
    const id = String(+new Date())
    const newBlog = {
      id,
      name,
      description,
      websiteUrl
    }

    blogsDb.push(newBlog)
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
      console.log(blogToUpdate)

    }
    return Boolean(blogToUpdate)
  },
  deleteBlogById(id: string){
    const blogToDeleteIndex = blogsDb.findIndex(blog => blog.id === id)

    if(blogToDeleteIndex === -1){
      return false
    } else {
      blogsDb.splice(blogToDeleteIndex, 1)
      return true
    }
  }
}
