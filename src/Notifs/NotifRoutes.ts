import { Router } from 'express'

import isAuth from '../middleware/isAuth'
import NotifController from './NotifController'

const router = Router()

router.get('/', isAuth, NotifController.all)
router.post('/', isAuth, NotifController.create)
router.patch('/:id', isAuth, NotifController.update)
router.delete('/:id', isAuth, NotifController.delete)

export default router
