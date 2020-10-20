import { Router } from 'express'

import isAuth from '../middleware/isAuth'
import UserController from './UserController'

const router = Router()

router.get('/', isAuth, UserController.retrieve)
router.patch('/', isAuth, UserController.update)
router.put('/', isAuth, UserController.updatePwd)
router.delete('/:id', isAuth, UserController.delete)

export default router
