import {NextFunction, Request, Response} from "express";

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const adminCredentials = 'YWRtaW46cXdlcnR5'

  // is it necessary to check req.headers.authorization firstly
  if(req.headers.authorization && req.headers.authorization === `Basic ${adminCredentials}`){
    next()
  } else {
    res.sendStatus(401)
  }
};
