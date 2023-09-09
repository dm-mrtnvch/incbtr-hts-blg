/// check import
import request from 'supertest'
import {app} from "../../src";
import {blogsDb, postsDb, testingMockData} from "../../src/db/mock_data";
import {IBlog, IPost} from "../../src/interfaces";

describe('/blogs', () => {
  beforeAll(async () => {
    await request(app)
      .delete('/testing/all-data')
      .expect(204)
  })

  it('should return 200 and empty db', async () => {
    await request(app)
      .get('/blogs')
      .expect(200, [])

    await request(app)
      .get('/posts')
      .expect(200, [])
  })

  let firstCreatedBlog: IBlog | null = null
  it('should create new blog', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      /// how auth works
      .auth('admin', 'qwerty')
      .send(testingMockData.blogs.firstValidValuesBlog)
      .expect(201)


    firstCreatedBlog = createResponse.body
    expect(firstCreatedBlog).toEqual({
      ...testingMockData.blogs.firstValidValuesBlog,
      id: expect.any(String),
      createdAt: expect.any(String),
      isMembership: false
    })
  })

  it('should get exact blog by id', async () => {
    const createdResponse = await request(app)
      .get(`/blogs/${firstCreatedBlog?.id}`)
      .expect(200)

    expect(createdResponse.body).toEqual({
      ...firstCreatedBlog,
      id: expect.any(String)
    })
  })
  //
  // it('should return blogs array', async () => {
  //   const response = await request(app)
  //     .get('/blogs')
  //     .expect(200)
  //
  //   const blogs: IBlog[] = response.body
  //
  //   expect(Array.isArray(blogs)).toBeTruthy();
  //
  //   blogs.forEach(blog => {
  //     expect(blog).toMatchObject({
  //       id: expect.any(String),
  //       name: expect.any(String),
  //       description: expect.any(String),
  //       websiteUrl: expect.any(String),
  //     });
  //   });
  // })
  //
  // it('should update blog by id', async () => {
  //   const dataForUpdate = {
  //     name: 'updated 1 blog',
  //     description: 'first description after updated',
  //     websiteUrl: 'https://www.updated-example.com'
  //   }
  //   await request(app)
  //     .put(`/blogs/${firstCreatedBlog?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(dataForUpdate)
  //     .expect(204)
  //
  //   const response = await request(app)
  //     .get(`/blogs/${firstCreatedBlog?.id}`)
  //     .expect(200)
  //
  //   const updatedBlog = response.body
  //
  //   expect(updatedBlog.name).toBe(dataForUpdate.name);
  //   expect(updatedBlog.description).toBe(dataForUpdate.description);
  //   expect(updatedBlog.websiteUrl).toBe(dataForUpdate.websiteUrl);
  // })
  //
  // it('shouldn\'t delete / post / put blog without auth', async () => {
  //   const dataForPostAndPut = {
  //     name: 'updated 1 blog',
  //     description: 'first description after updated',
  //     websiteUrl: 'https://www.updated-example.com'
  //   }
  //
  //   await request(app)
  //     .post('/blogs')
  //     .send(dataForPostAndPut)
  //     .expect(401)
  //
  //   await request(app)
  //     .put(`/blogs/${firstCreatedBlog?.id}`)
  //     .send(dataForPostAndPut)
  //     .expect(401)
  //
  //   await request(app)
  //     .delete(`/blogs/${firstCreatedBlog?.id}`)
  //     .expect(401)
  // })
  //
  // let secondCreatedBlog: any = null
  // it('should delete blog by id', async () => {
  //   await request(app)
  //     .delete(`/blogs/${firstCreatedBlog?.id}`)
  //     .auth('admin', 'qwerty')
  //     .expect(204)
  //
  //   await request(app)
  //     .get(`/blogs/${firstCreatedBlog?.id}`)
  //     .expect(404)
  //
  //   const response = await request(app)
  //     .post(`/blogs`)
  //     .auth('admin', 'qwerty')
  //     .send(testingMockData.secondCreatedBlog)
  //     .expect(201)
  //
  //   secondCreatedBlog = response.body
  //
  //   expect(secondCreatedBlog).toEqual({
  //     ...testingMockData.secondCreatedBlog,
  //     id: expect.any(String)
  //   })
  // })
  //
  //
  // it('should\'t create / update blog with incorrect body', async () => {
  //   const incorrectName: Omit<IBlog, 'id'> = {
  //     name: '16-length_sdfsdf',
  //     description: 'some description',
  //     websiteUrl: 'https://www.second-updated-example.com'
  //   }
  //   const incorrectDescription: Omit<IBlog, 'id'> = {
  //     name: '16-length_sdfsdf',
  //     description: '501-length_fsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhsss',
  //     websiteUrl: 'https://www.second-updated-example.com'
  //   }
  //   const incorrectWebsiteUrl: Omit<IBlog, 'id'> = {
  //     name: '16-length_sdfsdf',
  //     description: '501-length_fsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhskjayfuishfsdfsdffsdfsdfsfkhsss',
  //     websiteUrl: 'https://www.second-updated-example.com'
  //   }
  //   const incorrectBody: any = []
  //
  //   await request(app)
  //     .post(`/blogs`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectName)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/blogs`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectDescription)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/blogs`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectWebsiteUrl)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/blogs`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBody)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/blogs`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBody)
  //     .expect(400)
  //
  //
  //   await request(app)
  //     .put(`/blogs/${secondCreatedBlog?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectName)
  //     .expect(400)
  //
  //
  //   await request(app)
  //     .put(`/blogs/${secondCreatedBlog?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectDescription)
  //     .expect(400)
  //
  //
  //   await request(app)
  //     .put(`/blogs/${secondCreatedBlog?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectWebsiteUrl)
  //     .expect(400)
  //
  //   await request(app)
  //     .put(`/blogs/${secondCreatedBlog?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBody)
  //     .expect(400)
  // })
  //
  //
  // it('should update -> delete -> get 404', async () => {
  //   const dataForUpdate: Omit<IBlog, 'id'> = {
  //     name: 'updated field',
  //     description: 'updated description for second blog',
  //     websiteUrl: 'https://www.second-updated-example.com'
  //   }
  //   /// how to path second arg in expect with data if return data is required
  //   await request(app)
  //     .put(`/blogs/${secondCreatedBlog?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(dataForUpdate)
  //     .expect(204)
  //
  //   const response = await request(app)
  //     .get(`/blogs/${secondCreatedBlog?.id}`)
  //
  //   const updatedBlog = response.body
  //
  //   expect(updatedBlog).toEqual({
  //     ...dataForUpdate,
  //     id: expect.any(String)
  //   })
  //
  //   await request(app)
  //     .delete(`/blogs/${updatedBlog.id}`)
  //     .auth('admin', 'qwerty')
  //     .expect(204)
  //
  //   await request(app)
  //     .get(`/blogs/${updatedBlog.id}`)
  //     .expect(404)
  // })
  //
  //
  // let thirdCreatedBlog: any = null
  // let firstCreatedPost: any = null
  // it('should create post for existing blog', async () => {
  //   const dataForCreatePost: Omit<IPost, 'id' | 'blogId' | 'blogName'> = {
  //     title: 'post title',
  //     content: 'post content',
  //     shortDescription: 'post short description'
  //   }
  //
  //   const dataForCreateBlog: Omit<IBlog, 'id'> = {
  //     name: 'new blog',
  //     description: 'new description',
  //     websiteUrl: 'https://www.youtube.com'
  //   }
  //
  //   const blogsResponse = await request(app)
  //     .post('/blogs')
  //     .auth('admin', 'qwerty')
  //     .send(dataForCreateBlog)
  //     .expect(201)
  //
  //   thirdCreatedBlog = blogsResponse.body
  //
  //   await request(app)
  //     .get(`/blogs/${thirdCreatedBlog.id}`)
  //     .expect(200)
  //
  //   const postsResponse = await request(app)
  //     .post('/posts')
  //     .auth('admin', 'qwerty')
  //     .send({
  //       ...dataForCreatePost,
  //       blogId: thirdCreatedBlog.id
  //     })
  //     .expect(201)
  //
  //   firstCreatedPost = postsResponse.body
  //   console.log('firstCreatedPost', firstCreatedPost)
  //
  //   await request(app)
  //     .get(`/posts/${firstCreatedPost?.id}`)
  //     .expect(200)
  // })
  //
  // it('should return exact blog', async  () => {
  //   const dataForBlogCreation: Omit<IBlog, 'id'> = {
  //     name: 'some new blog',
  //     description: 'some new description',
  //     websiteUrl: 'https://www.example.com'
  //   }
  //
  //   const dataForPostCreation: Omit<IPost, 'id' | 'blogId' | 'blogName'> = {
  //     title: 'some title',
  //     content: 'some content',
  //     shortDescription: 'some short descr'
  //   }
  //
  //   const blogCreateResponse = await request(app)
  //     .post('/blogs')
  //     .auth('admin', 'qwerty')
  //     .send(dataForBlogCreation)
  //     .expect(201)
  //
  //   const newBlog = blogCreateResponse.body
  //
  //   const postCreateResponse = await request(app)
  //     .post(`/posts`)
  //     .auth('admin', 'qwerty')
  //     .send({
  //       ...dataForPostCreation,
  //       blogId: newBlog.id
  //     })
  //
  //   const newPost = postCreateResponse.body
  //
  //   await request(app)
  //     .get(`/posts/${newPost.id}`)
  //     .expect(200)
  // })
  //
  //
  // let secondCreatedPost: any = null
  // it('should update post by id', async () => {
  //   const dataForBlogCreation: Omit<IBlog, 'id'> = {
  //     name: 'some name',
  //     description: 'some descr',
  //     websiteUrl: 'https://www.example.com'
  //   }
  //
  //   const dataForPostCreation: Omit<IPost, 'id' | 'blogId' | 'blogName'> = {
  //     title: 'some title',
  //     shortDescription: 'short',
  //     content: 'content'
  //   }
  //
  //   const createBlogResponse = await request(app)
  //     .post('/blogs')
  //     .auth('admin', 'qwerty')
  //     .send(dataForBlogCreation)
  //     .expect(201)
  //
  //   const newBlog = createBlogResponse.body
  //
  //   const createPostResponse = await request(app)
  //     .post('/posts')
  //     .auth('admin', 'qwerty')
  //     .send({
  //       ...dataForPostCreation,
  //       blogId: newBlog.id
  //     })
  //
  //   secondCreatedPost = createPostResponse.body
  //
  //   await request(app)
  //     .get(`/posts/${secondCreatedPost.id}`)
  //     .expect(200)
  //
  //   await request(app)
  //     .put(`/posts/${secondCreatedPost.id}`)
  //     .auth('admin', 'qwerty')
  //     .send({
  //       ...dataForPostCreation,
  //       blogId: newBlog.id,
  //       shortDescription: 'updated short'
  //     })
  //     .expect(204)
  // })
  //
  //
  // it('should\'t create / update / delete  blog with incorrect data', async () => {
  //   const incorrectTitle: Omit<IPost, 'id' | 'blogName'> = {
  //     title: '31-length_sdfsdfsdsdfdsfasjhfsf',
  //     content: 'some description',
  //     shortDescription: 'short',
  //     blogId: thirdCreatedBlog.id
  //   }
  //   const incorrectContent: Omit<IPost, 'id' | 'blogName'> = {
  //     title: 'ok title',
  //     content: '',
  //     shortDescription: 'https://www.second-updated-example.com',
  //     blogId: thirdCreatedBlog.id
  //   }
  //   const incorrectShortDescription: Omit<IPost, 'id' | 'blogName'> = {
  //     title: '16-length_sdfsdf',
  //     content: 'ok content',
  //     shortDescription: '',
  //     blogId: thirdCreatedBlog.id
  //   }
  //
  //   const incorrectBlogId: Omit<IPost, 'id' | 'blogName'> = {
  //     title: 'ok title',
  //     content: 'ok content',
  //     shortDescription: 'short',
  //     blogId: ''
  //   }
  //   const incorrectBody: any = []
  //
  //   await request(app)
  //     .post(`/posts`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectTitle)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/posts`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectContent)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/posts`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectShortDescription)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/posts`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBody)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/posts`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBody)
  //     .expect(400)
  //
  //   await request(app)
  //     .post(`/posts`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBlogId)
  //     .expect(400)
  //
  //   await request(app)
  //     .put(`/posts/${secondCreatedPost?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectTitle)
  //     .expect(400)
  //
  //   await request(app)
  //     .put(`/posts/${secondCreatedPost?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectContent)
  //     .expect(400)
  //
  //   await request(app)
  //     .put(`/posts/${secondCreatedPost?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectShortDescription)
  //     .expect(400)
  //
  //   await request(app)
  //     .put(`/posts/${secondCreatedPost?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBody)
  //     .expect(400)
  //
  //   await request(app)
  //     .put(`/posts/${secondCreatedPost?.id}`)
  //     .auth('admin', 'qwerty')
  //     .send(incorrectBlogId)
  //     .expect(400)
  //
  //   await request(app)
  //     .delete(`/posts/${secondCreatedPost?.id}`)
  //     .expect(401)
  // })
})
