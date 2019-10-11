require('../database');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const SessionController = require('../controllers/SessionController');
const UserController = require('../controllers/UserController');
const ToolController = require('../controllers/ToolController');

router.post('/users', UserController.create);
router.post('/session', SessionController.create);

router.use(auth);

router.put('/users', UserController.update);

router.post('/tools', ToolController.create);
router.get('/tools', ToolController.index);

module.exports = router;