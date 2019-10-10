require('../database');
const router = require('express').Router();
const SessionController = require('../controllers/SessionController');
const UserController = require('../controllers/UserController');

router.post('/users', UserController.create);
router.post('/session', SessionController.create);

module.exports = router;