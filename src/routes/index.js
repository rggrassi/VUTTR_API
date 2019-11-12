require('../database');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const SessionController = require('../controllers/SessionController');
const UserController = require('../controllers/UserController');
const ToolController = require('../controllers/ToolController');
const ForgotPasswordController = require('../controllers/ForgotPasswordController');

router.post('/users', UserController.create);
router.post('/session', SessionController.create);

router.post('/forgot-password', ForgotPasswordController.store);
router.put('/forgot-password', ForgotPasswordController.update);

router.use(auth);

router.put('/users/:id', UserController.update);

router.post('/tools', ToolController.create);
router.get('/tools', ToolController.index);
router.delete('/tools/:id', ToolController.remove);

module.exports = router;