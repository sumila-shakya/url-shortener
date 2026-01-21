import { Router } from "express";
import { urlControllers } from "../controllers/urlController";

const router = Router()

//url shortening route
router.post('/api/urls',urlControllers.createUrl)

//redirect route
router.get('/:shortCode',urlControllers.redirectUrl)

//analytics route
router.get('/api/urls/:shortCode/stats',urlControllers.getAnalytics)

export default router
