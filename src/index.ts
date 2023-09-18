import cookieParser from "cookie-parser";
import express, {Request, Response} from 'express'
import {blogsCollection, commentsCollection, postsCollection, runDb, usersCollection} from "./db/db";
import {authRouter} from "./routes/auth";
import {blogsRouter} from "./routes/blogs";
import {commentsRouter} from "./routes/comments";
import {postsRouter} from "./routes/posts";
import {usersRouter} from "./routes/users";

// userViewType - front
// userDbType - back

export const app = express()
app.use(express.json())
app.use(cookieParser())
const port = process.env.PORT || 3020

console.log('4444')

app.delete('/testing/all-data', async (req: Request, res: Response) => {
  await blogsCollection.deleteMany({})
  await postsCollection.deleteMany({})
  await usersCollection.deleteMany({})
  await commentsCollection.deleteMany({})
  res.sendStatus(204)
})

app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)



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
