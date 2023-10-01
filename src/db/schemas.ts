import mongoose from "mongoose"
import {IBlog, IPost, IUserDb, LIKE_STATUS_ENUM} from "../interfaces"

export const userSchema = new mongoose.Schema<IUserDb>({
  id: String,
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

export const deviceSchema = new mongoose.Schema({
  ip: String,
  title: String,
  deviceId: String,
  userId: String,
  lastActiveDate: String,
})

export const requestsSchema = new mongoose.Schema({
  IP: String,
  URL: String,
  date: Date
})

export const blogSchema = new mongoose.Schema<IBlog>({
  id: String,
  name: String,
  description: String,
  websiteUrl: String,
  isMembership: Boolean,
  createdAt: String,
})

export const postSchema = new mongoose.Schema<IPost>({
  id: String,
  title: String,
  shortDescription: String,
  content: String,
  blogId: String,
  blogName: String,
  createdAt: String,
})

export const commentLikeSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  likeStatus: {
    type: String,
    enum: LIKE_STATUS_ENUM,
    default: LIKE_STATUS_ENUM.NONE
  }
}, {_id: false})

export const commentSchema = new mongoose.Schema({
  id: String,
  content: String,
  commentatorInfo: {
    userId: String,
    userLogin: String,
  },
  postId: String,
  createdAt: String,
  likes: [commentLikeSchema]
})
