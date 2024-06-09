const Router = require('express').Router;
const userController = require('../controllers/userController');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/sendmail', userController.sendMail);
router.get('/cancel-appointment/:tokenId', userController.cancelAppointment);
router.get('/exe', userController.getExecuters);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);
router.get('/', userController.getAll);
router.get('/:id', userController.getOn);
router.post('/c', userController.create);
router.post('/checkEmail', userController.checkEmail);
router.put('/users/:id', userController.updateUser);




module.exports = router;