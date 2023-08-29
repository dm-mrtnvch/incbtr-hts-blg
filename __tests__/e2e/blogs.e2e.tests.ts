import request from 'supertest'
import {app} from "../../src";

describe('/blogs', () => {
  beforeAll(async () => {
    await request(app).delete('/testing/all-data')
  })


  it('should return 200 and empty array', async () => {
    await request(app)
      .get('/blogs')
      .expect(200, [])
  })

  it('should return 404 for not existing blog', async () => {
    await request(app)
      .get('/blogs/1')
      .expect(404)
  })

  it('shouldn\'t create blog with correct input data', async () => {
    await request(app)
      .post('/blogs')
      .send({
        id: '123123',
        name: 'sfdsf',
        description: 'some desc',
        websiteUrl: ''
      })
      .expect(400)
  })

  it('should return 200 and empty array', async () => {
    await request(app)
      .get('/blogs')
      .expect(200, [])
  })

  let createdBlog: any = null
  it('shouldn\'t create blog with correct input data', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      .send({
        id: '123123',
        name: 'sfdsf',
        description: 'some desc',
        websiteUrl: ''
      })
      .expect(400)

    createdBlog = createResponse.body
    expect(createdBlog).toEqual({
      id: expect.any(String),
      name: 'sfdsf',
      description: 'some desc',
      websiteUrl: ''
    })

    await request(app)
      .get('/blogs')
      .expect(200, [createdBlog])
  })

  it('should update blog with correct input data', async () => {
    await request(app)
      .put(`/blogs/${createdBlog.id}`)
      .send({
        id: '123123',
        name: 'sfdsf',
        description: 'some desc',
        websiteUrl: ''
      })
      .expect(400)

    await request(app)
      .get(`/blogs/${createdBlog.id}`)
      .expect(200, [createdBlog])
  })

  it('should\'t update blog with unexisting id', async () => {
    await request(app)
      .put('/blogs/2')
      .send({
        id: '123123',
        name: 'sfdsf',
        description: 'some desc',
        websiteUrl: ''
      })
      .expect(404)

    await request(app)
      .get(`/blogs/${createdBlog.id}`)
      .expect(200, [createdBlog])
  })
})
