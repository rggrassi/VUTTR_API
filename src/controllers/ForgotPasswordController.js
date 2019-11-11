const User = require('../models/User');
const crypto = require('crypto');
const Yup = require('yup');
const { validate } = require('../utils/validation');

const create = async(req, res) => {
    const schema = Yup.object().shape({
        email: Yup.string().email().required()
    });

    const { value, errors } = await validate(req.body, schema);
    if (errors) {
        return res.status(400).json(errors);
    }

    const user = await User.findOne({ email: value.email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' })
    }

    user.token = crypto.randomBytes(32).toString('hex');
    user.token_created_at = new Date();

    await user.save();
}

module.exports = { create }