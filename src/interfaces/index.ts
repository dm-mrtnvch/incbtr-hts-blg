import {Request} from "express";
import {SortDirection} from "mongodb";
import Any = jasmine.Any;
// import {expiredTokensCollection} from "../db/db";

export interface IBlog {
  id: string
  name: string
  description: string
  websiteUrl: string
  isMembership: boolean
  createdAt: string
}

export interface IPost {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  createdAt: string
  extendedLikesInfo: {
    dislikesCount: Number,
    likesCount: number,
    myStatus: LIKE_STATUS_ENUM,
    newestLikes: Array<Any>
  }
}

export interface IUser {
  id: string
  login: string
  password: string
  email: string
  createdAt: string
}

export type AccountData = {
  login: string
  email: string
  passwordHash: string
  passwordSalt: string
  createdAt: string
}

export type EmailConfirmationType = {
  confirmationCode: string | null
  expirationDate: Date | null
  isConfirmed: boolean
}

export type IUserDb = {
  id: string
  accountData: AccountData
  emailConfirmation: EmailConfirmationType,
  passwordRecovery: {
    recoveryCode: string,
    expirationDate: Date
  }
}


export interface IUserView {
  id: string
  login: string
  // password: string
  email: string
  createdAt: string
}

export type RequestErrorsValidationType = {
  field: string,
  message: string
}

export interface IExpiredTokens {
  token: string
}

export type RequestWithParams<P> = Request<P, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B, {}>
export type RequestWithParamsAndBodyAndUser<P, B, R extends { id: string }> = Request<P, {}, B, {}, R>
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>


export interface IPaginationRequest {
  pageNumber?: number,
  pageSize?: number
  sortBy?: string,
  sortDirection?: SortDirection
}

export interface IPaginationWithSearchRequest extends IPaginationRequest {
  searchNameTerm?: string,
}

export interface IBlogRequest {
  name: string
  description: string
  websiteUrl: string
}

export interface IPostRequest {
  title: string,
  shortDescription: string,
  content: string
}

export interface IRequestsCount {
  IP: string,
  URL: string,
  date: Date
}

export interface IDeviceSessions {
  ip: string,
  title: string,
  deviceId: string,
  userId: string
  lastActiveDate: string
}

export interface CommentViewInterface {
  id: string,
  content: string,
  commentatorInfo: {
    userLogin: string
    userId: string,
  }
  createdAt: string
}

export interface PaginationInterface <I> {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: I
}



// ENUMS
export enum LIKE_STATUS_ENUM {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike'
}
