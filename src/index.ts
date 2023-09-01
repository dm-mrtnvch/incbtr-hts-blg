import express, {Request, Response} from 'express'
import {runDb} from "./db/db";
import {blogsDb, postsDb} from "./db/mock_data";
import {BlogsRouter} from "./routes/blogs";
import {postsRouter} from "./routes/posts";

export const app = express()
app.use(express.json())
const port = process.env.PORT || 3020

console.log('4444')

app.delete('/testing/all-data', (req: Request, res: Response) => {
  blogsDb.length = 0
  postsDb.length = 0
  res.sendStatus(204)
})

app.use('/blogs', BlogsRouter)
app.use('/posts', postsRouter)



// app.listen(port, () => {
//   console.log(`app running on ${port} port`)
// })

const startApp = async () => {
  await runDb()

  app.listen(port, () => {
    console.log(`app running on ${port} port`)
  })
}

startApp()
