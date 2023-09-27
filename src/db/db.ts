import * as dotenv from 'dotenv'
import mongoose from "mongoose";
import {IBlog, IPost} from "../interfaces";

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

/// user has another structure
// const userSchema = new mongoose.Schema({
//   id:String,
//   login:String,
//   password:String,
//   email:String,
//   createdAt: String,
// })
//

const userSchema = new mongoose.Schema({
  id:String,
  accountData: {
    login: String,
    email: String,
    passwordHash: String,
    passwordSalt: String,
    createdAt: String
  },
  emailConfirmation: {
    confirmationCode: String,
    expirationDate: Date,
    isConfirmed: Boolean,
  },
  passwordRecovery: {
    recoveryCode: String,
    expirationDate: Date
  }
})


const postSchema = new mongoose.Schema<IPost>({
  id: String,
  title: String,
  shortDescription: String,
  content: String,
  blogId: String,
  blogName: String,
  createdAt: String,
})

const commentSchema = new mongoose.Schema({
  id: String,
  content: String,
  commentatorInfo: {
    userId: String,
    userLogin: String,
  },
  createdAt: String,
})

const deviceSchema = new mongoose.Schema({
  ip: String,
  title: String,
  deviceId: String,
  userId: String,
  lastActiveDate: String,
})

const requestsSchema = new mongoose.Schema({
  IP: String,
  URL: String,
  date: Date
})



export const UserModel = mongoose.model('users', userSchema)
export const DeviceSessionModel = mongoose.model('deviceSessions', deviceSchema)
export const RequestsModel = mongoose.model('requests', requestsSchema)

export const BlogModel = mongoose.model('blogs', blogSchema);
export const PostModel = mongoose.model('posts', postSchema)
export const CommentModel = mongoose.model('comments', commentSchema)


// const client = new MongoClient(url)

// export const usersCollection = client.db().collection<IUser>('users')
// export const authCollection = client.db().collection('auth')

// export const blogsCollection = client.db().collection<IBlog>('blogs')
// export const postsCollection = client.db().collection<IPost>('posts')
// export const commentsCollection = client.db().collection('comments')
// export const requestsCollection = client.db().collection<IRequestsCount>('requests')
// export const deviceSessionsCollection = client.db().collection<IDeviceSessions>('deviceSessions')

/// to remove
// export const expiredTokensCollection = client.db().collection<IExpiredTokens>('expiredTokens')



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
