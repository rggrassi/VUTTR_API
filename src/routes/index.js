require('../database');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const SessionController = require('../controllers/SessionController');
const UserController = require('../controllers/UserController');

router.post('/users', UserController.create);
router.post('/session', SessionController.create);

router.use(auth);

router.put('/users', UserController.update);


module.exports = router;