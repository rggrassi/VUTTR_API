require('./bootstrap');

const Queue = require('./lib/Queue');
const AccountConfirmation = require('./jobs/AccountConfirmation');

Queue.process(AccountConfirmation.handle);