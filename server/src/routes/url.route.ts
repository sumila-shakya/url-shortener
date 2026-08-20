import { Router } from "express";
import { urlControllers } from "../controllers/url.controller";
import { rateLimiter } from "../middleware/rateLimiter.middleware";
import { cacheCode } from "../middleware/cache.middleware";

const router = Router()

//url shortening route
router.post('/api/urls', rateLimiter, urlControllers.createUrl)

//redirect route
router.get('/:shortCode', cacheCode, urlControllers.redirectUrl)

//analytics route
router.get('/api/urls/:shortCode/stats',urlControllers.getAnalytics)

export default router
