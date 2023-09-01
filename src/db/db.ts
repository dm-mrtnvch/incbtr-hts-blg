import {MongoClient} from "mongodb"
import * as dotenv from 'dotenv'
import {IBlog} from "../interfaces";
dotenv.config()

const url = process.env.MONGO_URL
if(!url){
  throw Error('didn\'t find url')
}
const client = new MongoClient(url)

export const blogsCollection = client.db().collection<IBlog>('blogs')

export const runDb = async () => {
  try {
    await client.connect()
    await client.db('blogs').command({ping: 1})
  } catch (e) {
    console.log('connection failure')
    await client.close()
  }
}
