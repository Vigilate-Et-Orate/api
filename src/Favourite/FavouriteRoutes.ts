import { Router } from 'express'
import isAuth from '../middleware/isAuth'

import FavouriteController from './FavouriteController'

const router = Router()

router.get('/', isAuth, FavouriteController.all)
router.post('/', isAuth, FavouriteController.create)
router.get('/:prayerId', isAuth, FavouriteController.retrieve)

export default router
