import {Request} from "express";

export interface IUnique {
  id: string
  createdAt: string
}

export interface IBlog extends IUnique {
  name: string
  description: string
  websiteUrl: string
  isMembership: boolean
}

export interface IPost extends IUnique {
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
}

export interface IUser extends IUnique {
  login: string
  password: string
  email: string
}

export type RequestWithParams<P>  = Request<P, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B, {}>
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>
