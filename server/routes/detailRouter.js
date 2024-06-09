const Router = require('express')
const router = new Router()
const detailController = require('../controllers/detailController')

router.post('/', detailController.create)
router.get('/', detailController.getAll)
router.get('/:id', detailController.getOn)
router.put('/:id', detailController.updateDetail);

module.exports = router