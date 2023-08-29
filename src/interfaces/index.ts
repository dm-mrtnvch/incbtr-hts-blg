import {Request} from "express";

export interface IUnique {
  id: string
}

export interface IBlog extends IUnique {
  name: string
  description: string
  websiteUrl: string
}

export interface IPost extends IUnique {
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
}

export type RequestWithParams<P>  = Request<P, {}, {}, {}>
export type RequestWithBody<B> = Request<{}, {}, B, {}>
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B, {}>
