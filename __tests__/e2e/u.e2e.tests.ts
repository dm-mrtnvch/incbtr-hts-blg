/// check import
import request from 'supertest'
import {app} from "../../src";
import nodemailer from "nodemailer";
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true),
    }),
  };
});



describe('all', () => {
  beforeAll(async () => {
    await request(app)
      .delete('/testing/all-data')
      .expect(204)
  })


  it('should return 200 and empty db', async () => {
    await request(app)
      .get('/blogs')
      .expect(200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })

    await request(app)
      .get('/posts')
      .expect(200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })

    await request(app)
      .get('/users')
      .auth('admin', 'qwerty')
      /// pagesCount 0 but page 1???
      .expect(200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
  })




  it('should create new user and send confirmation email with code', async () => {


    const createResponse = await request(app)
      .post('/auth/registration')
      .send({
        login: "admin",
        password: "adminadmin",
        email: "dmvshn@gmail.com"
      })
      // .expect(201)

    console.log(createResponse)


    expect(nodemailer.createTransport().sendMail).toBeCalledWith({
      to: 'example@example.com',
      subject: 'Test Subject',
      text: 'Hello there!'
    });
    //
    // firstCreatedBlog = createResponse.body
    // expect(firstCreatedBlog).toEqual({
    //   ...testingMockData.blogs.firstValidValuesBlog,
    //   id: expect.any(String),
    //   createdAt: expect.any(String),
    //   isMembership: false
    // })
  })

  // it('should get exact blog by id', async () => {
  //   const createdResponse = await request(app)
  //     .get(`/blogs/${firstCreatedBlog?.id}`)
  //     .expect(200)
  //
  //   expect(createdResponse.body).toEqual({
  //     ...firstCreatedBlog,
  //     id: expect.any(String)
  //   })
  // })
})
