import { Router } from 'express'

import AuthController from './AuthController'

const router = Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/social', AuthController.social)

export default router
