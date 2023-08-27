import express, {Request, Response} from 'express'
import {BlogsRouter} from "./routes/blogs";

export const app = express()
app.use(express.json())
const port = process.env.PORT || 3020

app.use('/blogs', BlogsRouter)

app.listen(port, () => {
  console.log(`app running on ${port} port`)
})

