const Router = require('express')
const router = new Router()
const orderRouter = require('./orderRouter')
const userRouter = require('./userRouter')
const detailRouter = require('./detailRouter')
const orderDetailRouter = require('./orderDetailRouter')
const availableTimesRouter = require('./availableTimesRouter');

router.use('/order', orderRouter)
router.use('/user', userRouter)
router.use('/detail', detailRouter)
router.use('/orderdetail', orderDetailRouter)
router.use('/available', availableTimesRouter)

module.exports = router