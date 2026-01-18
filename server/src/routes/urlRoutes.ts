import { Router } from "express";
import { urlControllers } from "../controllers/urlController";

const router = Router()

router.post('/api/urls',urlControllers.createUrl)

//redirect route
router.get('/:shortCode',urlControllers.redirectUrl)

export default router
