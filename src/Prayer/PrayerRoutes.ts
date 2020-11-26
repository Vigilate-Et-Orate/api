import { Router } from 'express'
import isAdmin from '../middleware/isAdmin'

import PrayerController from './PrayerController'

const router = Router()

router.get('/', PrayerController.all)
router.post('/', isAdmin, PrayerController.create)
router.get('/:id', PrayerController.retrieve)
router.patch('/:id', isAdmin, PrayerController.update)
router.delete('/:id', isAdmin, PrayerController.delete)

export default router
