require('../database');
const router = require('express').Router();
const auth = require('../helpers/route/auth');
const validate = require('../helpers/route/validation');
const schemas = require('../helpers/route/validation/schemas');
const SessionController = require('../controllers/SessionController');
const UserController = require('../controllers/UserController');
const ToolController = require('../controllers/ToolController');
const ForgotPasswordController = require('../controllers/ForgotPasswordController');
const AccountConfirmation = require('../controllers/AccountConfirmation');

router.post('/users', validate(schemas.userCreate), UserController.create);
router.post('/session', validate(schemas.session), SessionController.create);

router.post('/forgot-password', validate(schemas.forgotStore), ForgotPasswordController.store);
router.put('/forgot-password/:token', validate(schemas.forgotUpdate), ForgotPasswordController.update);

router.post('/account-confirmation', validate(schemas.accountConfirmationStore), AccountConfirmation.store);
router.put('/account-confirmation/:token', validate(schemas.accountConfirmationUpdate), AccountConfirmation.update);

router.use(auth);

router.put('/users/:id', validate(schemas.userUpdate), UserController.update);

router.post('/tools', validate(schemas.toolCreate), ToolController.create);
router.get('/tools', ToolController.index);
router.delete('/tools/:id', ToolController.remove);

module.exports = router;