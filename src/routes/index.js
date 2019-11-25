require('../database');
const router = require('express').Router();
const auth = require('../helpers/route/auth');
const validate = require('../helpers/route/validation');
const schemas = require('../helpers/route/validation/schemas');
const SessionController = require('../controllers/SessionController');
const UserController = require('../controllers/UserController');
const ToolController = require('../controllers/ToolController');
const ForgotPasswordController = require('../controllers/ForgotPasswordController');
const AccountConfirmationController = require('../controllers/AccountConfirmationController');

router.post('/users', validate(schemas.userCreate), UserController.create);
router.post('/session', validate(schemas.session), SessionController.create);

router.post('/forgot', validate(schemas.forgotStore), ForgotPasswordController.store);
router.put('/forgot/:token', validate(schemas.forgotUpdate), ForgotPasswordController.update);

router.post('/account', validate(schemas.accountStore), AccountConfirmationController.store);
router.put('/account/:token', AccountConfirmationController.update);

router.use(auth);

router.put('/users/:id', validate(schemas.userUpdate), UserController.update);

router.post('/tools', validate(schemas.toolCreate), ToolController.create);
router.get('/tools', ToolController.index);
router.delete('/tools/:id', ToolController.remove);

module.exports = router;