import { Router } from "express";
import { urlControllers } from "../controllers/urlController";

const router = Router()

router.post('/urls',urlControllers.createUrl)

export default router
