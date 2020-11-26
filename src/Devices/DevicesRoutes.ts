import { Router } from 'express'
import isAuth from '../middleware/isAuth'

import DevicesController from './DevicesController'

const router = Router()

router.get('/', isAuth, DevicesController.all)
router.post('/', isAuth, DevicesController.create)
router.get('/:id', isAuth, DevicesController.retrieve)
router.patch('/:id', isAuth, DevicesController.update)
router.delete('/:id', isAuth, DevicesController.delete)

export default router
