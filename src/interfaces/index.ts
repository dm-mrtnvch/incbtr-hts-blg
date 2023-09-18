import {Request} from "express";
import {expiredTokensCollection} from "../db/db";

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
  emailConfirmation: EmailConfirmationType
}



export interface IUserView {
  id: string
  login: string
  password: string
  email: string
  createdAt: string
}

export interface IExpiredTokens {
  token: string
}

export type RequestWithParams<P>  = Request<P, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B, {}>
export type RequestWithParamsAndBodyAndUser<P, B, R extends {id: string}>  = Request<P, {}, B, {}, R>
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>
