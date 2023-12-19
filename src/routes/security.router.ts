import {Router} from "express";
import {SecurityController} from "../controllers/security.controller";
import {container} from "../inversify/inversify.config";
import {RefreshTokenAuthMiddleware} from "../middlewares/middlewares";

const securityController = container.resolve(SecurityController)
export const securityRouter = Router()

securityRouter.get('/devices',
  RefreshTokenAuthMiddleware,
  securityController.getDevices.bind(securityController)
)

securityRouter.delete('/devices',
  RefreshTokenAuthMiddleware,
  securityController.deleteDevices.bind(securityController)
)

securityRouter.delete('/devices/:deviceId',
  RefreshTokenAuthMiddleware,
  securityController.deleteDevice.bind(securityController)
)

