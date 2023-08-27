import express, {Request, Response} from 'express'
import {BlogsRouter} from "./routes/blogs";

export const app = express()
app.use(express.json())
const PORT = 3020

app.use('/blogs', BlogsRouter)

app.listen(PORT, () => {
  console.log(`app running on ${PORT} port`)
})

