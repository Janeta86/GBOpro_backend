const Router = require('express')
const router = new Router()
const orderDetailController = require("../controllers/orderDetailController");

router.post('/', orderDetailController.create)
router.get('/', orderDetailController.getAll)
router.get('/:id', orderDetailController.getOn)
router.get('/order/:orderId', orderDetailController.getOrderDetails);
router.put('/:id', orderDetailController.updateOrderDetail);

module.exports = router
