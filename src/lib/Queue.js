const Queue = require('bull');
const redisConfig = require('../config/redis');
const AccountConfirmation = require('../jobs/AccountConfirmation');

const mailQueue = new Queue(AccountConfirmation.key, redisConfig);

module.exports = mailQueue;