import {IBlog, IPost} from "../interfaces";

export const blogsDb: IBlog[] = [
  // {
  //   id: '1',
  //   name: 'first blog',
  //   description: 'first description',
  //   websiteUrl: 'www.example.com'
  // },
  // {
  //   id: '2',
  //   name: 'second blog',
  //   description: 'second  description',
  //   websiteUrl: 'www.example-two.com'
  // },
]


export const postsDb: any[] = [
  {
    id: '7',
    title: '777',
    shortDescription: 'seven',
    content: 's e v e n',
    blogId: '1',
    blogName: 'first blog'
  },
  {
    id: '8',
    title: '888',
    shortDescription: 'eight',
    content: 'e i g h t',
    blogId: '2',
    blogName: 'second blog'
  }
]


export const testingMockData = {
  firstCreatedBlog: {
    name: 'first blog',
    description: 'first description',
    websiteUrl: 'https://www.example.com'
  },
  secondCreatedBlog: {
      name: 'second blog',
      description: 'second description',
      websiteUrl: 'https://www.second-example.com'
  }
}
