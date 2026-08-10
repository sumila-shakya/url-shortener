import { Router } from "express";
import { urlControllers } from "../controllers/urlController";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router()

//url shortening route
router.post('/api/urls', rateLimiter.limitCreation, urlControllers.createUrl)

//redirect route
router.get('/:shortCode',urlControllers.redirectUrl)

//analytics route
router.get('/api/urls/:shortCode/stats',urlControllers.getAnalytics)

export default router
