require('../database');
const router = require('express').Router();
const User = require('../models/User');

router.post('/user', async (req, res) => {
    const user = await User.create(req.body);
    return res.json(user);
})

module.exports = router;