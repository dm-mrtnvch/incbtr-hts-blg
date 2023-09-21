import {Request, Response, Router} from "express";
import {jwtService} from "../application/jwt/jwt.service";
import {deviceSessionsCollection} from "../db/db";
import {RequestWithQuery} from "../interfaces";
import {AccessTokenAuthMiddleware, RefreshTokenAuthMiddleware} from "../middlewares/middlewares";

export const securityRouter = Router()

securityRouter.get('/devices',
  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    const { userId} =req.jwtPayload
    const activeSessions = await deviceSessionsCollection.find({userId},{projection: {_id: 0, userId: 0}}).toArray()
    res.send(activeSessions)

  })

securityRouter.delete('/devices',
  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {

    const {deviceId, userId, iat} =req.jwtPayload

    const device = await deviceSessionsCollection.findOne({deviceId, userId})
    if(!device) return res.sendStatus(401)
    if(device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)

    await deviceSessionsCollection.deleteMany({userId, deviceId: {$ne: deviceId}})

    return res.sendStatus(204)
  })

securityRouter.delete('/devices/:deviceId',
  RefreshTokenAuthMiddleware,
  async (req: Request, res: Response) => {
    const {deviceId} = req.params
    const { userId, iat} =req.jwtPayload

    const device = await deviceSessionsCollection.findOne({deviceId})
    if(!device) return res.sendStatus(404)
      if(device.userId !== userId) return res.sendStatus(403)
    // if(device.lastActiveDate !== new Date(iat * 1000).toISOString()) return res.sendStatus(401)


        await deviceSessionsCollection.deleteOne({deviceId})

    return res.sendStatus(204)
  })
