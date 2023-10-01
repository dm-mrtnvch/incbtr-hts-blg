import mongoose from "mongoose"
import {IUserDb} from "../interfaces"
import {blogSchema, commentSchema, deviceSchema, postSchema, requestsSchema, userSchema} from "./schemas"

export const UserModel = mongoose.model<IUserDb>('users', userSchema)
export const DeviceSessionModel = mongoose.model('deviceSessions', deviceSchema)
export const RequestsModel = mongoose.model('requests', requestsSchema)
export const BlogModel = mongoose.model('blogs', blogSchema);
export const PostModel = mongoose.model('posts', postSchema)
export const CommentModel = mongoose.model('comments', commentSchema)
