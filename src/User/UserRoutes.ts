import { Router } from 'express'

import isAuth from '../middleware/isAuth'
import isAdmin from '../middleware/isAdmin'
import UserController from './UserController'

const router = Router()

router.get('/', isAdmin, UserController.all)
router.get('/:id', isAdmin, UserController.retrieve)
router.patch('/:id', isAdmin, UserController.update)
router.put('/:id', isAdmin, UserController.updatePwd)
router.delete('/:id', isAdmin, UserController.delete)

export const meRouter = Router()

meRouter.get('/', isAuth, UserController.retrieve)
meRouter.patch('/', isAuth, UserController.update)
meRouter.put('/', isAuth, UserController.updatePwd)
meRouter.delete('/', isAuth, UserController.delete)

export default router
