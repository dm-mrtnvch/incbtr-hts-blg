import {randomUUID} from "crypto";
import {MongoClient, UUID} from "mongodb"
import * as dotenv from 'dotenv'
import {IBlog, IExpiredTokens, IPost, IUser} from "../interfaces";
dotenv.config()

const url = process.env.MONGO_URL || "mongodb://0.0.0.0:27017"
if(!url){
  throw Error('didn\'t find url')
}
const client = new MongoClient(url)

export const blogsCollection = client.db().collection<IBlog>('blogs')
export const postsCollection = client.db().collection<IPost>('posts')
export const usersCollection = client.db().collection<IUser>('users')
export const authCollection = client.db().collection('auth')
export const commentsCollection = client.db().collection('comments')
export const expiredTokensCollection = client.db().collection<IExpiredTokens>('expiredTokens')


export const runDb = async () => {
  try {
    await client.connect()
    // await client.db('blogs').command({ping: 1})
  } catch (e) {
    console.log('connection failure')
    await client.close()
  }
}
