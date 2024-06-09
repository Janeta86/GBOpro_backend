const Router = require('express')
const router = new Router()
const orderController = require("../controllers/orderController");

router.post('/', orderController.create)
router.get('/', orderController.getAll)
router.get('/:id', orderController.getOn)
router.get('/user/:userId', orderController.getUserOrders);
router.put('/:id', orderController.updateOrder);
router.post('/api/orders/:orderId/details', orderController.addDetails);

module.exports = router
