import {randomUUID} from "crypto";
import {MongoClient, UUID} from "mongodb"
import * as dotenv from 'dotenv'
import {IBlog, IDeviceSessions, IExpiredTokens, IPost, IRequestsCount, IUser} from "../interfaces";
import mongoose from "mongoose";

dotenv.config()

const url = process.env.MONGO_URL || "mongodb://0.0.0.0:27017"
if(!url){
  throw Error('didn\'t find url')
}


const blogSchema = new mongoose.Schema<IBlog>({
  id: String,
  name: String,
  description: String,
  websiteUrl: String,
  isMembership: Boolean,
  createdAt:String,
})

const userSchema = new mongoose.Schema({
  id:String,
  login:String,
  password:String,
  email:String,
  createdAt: String,
})


export const BlogModel = mongoose.model('blogs', blogSchema);
export const usersCollection = mongoose.model('users', userSchema)

// const client = new MongoClient(url)

// export const blogsCollection = client.db().collection<IBlog>('blogs')
// export const postsCollection = client.db().collection<IPost>('posts')
// export const usersCollection = client.db().collection<IUser>('users')
// export const authCollection = client.db().collection('auth')
// export const commentsCollection = client.db().collection('comments')
// export const expiredTokensCollection = client.db().collection<IExpiredTokens>('expiredTokens')
// export const requestsCollection = client.db().collection<IRequestsCount>('requests')
// export const deviceSessionsCollection = client.db().collection<IDeviceSessions>('deviceSessions')


// export const runDb = async () => {
//   try {
//     await client.connect()
//     // await client.db('blogs').command({ping: 1})
//   } catch (e) {
//     console.log('connection failure')
//     await client.close()
//   }
// }

export const runDb = async () => {
  try {
    await mongoose.connect(url, {dbName: 'wreader-dev'})
    // await client.db('blogs').command({ping: 1})
  } catch (e) {
    console.log('connection failure')
    await mongoose.disconnect()
     // await client.close()
  }
}
