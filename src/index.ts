import cookieParser from "cookie-parser";
import express, {Request, Response} from 'express'
import {
  BlogModel,
  commentsCollection, deviceSessionsCollection,
  postsCollection,
  requestsCollection,
  runDb,
  usersCollection
} from "./db/db";
import {authRouter} from "./routes/auth.router";
import {blogsRouter} from "./routes/blogs.router";
import {commentsRouter} from "./routes/comments.router";
import {postsRouter} from "./routes/posts.router";
import {securityRouter} from "./routes/security.router";
import {usersRouter} from "./routes/users.router";


// userViewType - front
// userDbType - back

export const app = express()
app.use(express.json())
app.use(cookieParser())
app.set('trust proxy', true)
const port = process.env.PORT || 3020

console.log('4444')

app.delete('/testing/all-data', async (req: Request, res: Response) => {
   await Promise.all(
     [BlogModel.deleteMany({}),
       postsCollection.deleteMany({}),
       usersCollection.deleteMany({}),
       commentsCollection.deleteMany({}),
       requestsCollection.deleteMany({}),
       deviceSessionsCollection.deleteMany({})]
   )
  res.sendStatus(204)
})

app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/security', securityRouter)



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
