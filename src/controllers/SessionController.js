const User = require('../models/User');
const Yup = require('yup');
const jwt = require('jsonwebtoken');

const create = async (req, res) => {
    const { email, password } = req.body;

    const schema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required()
    })

    if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ error: 'Could not find your account.' })
    }

    if (!(await user.checkPassword(password))) {
        return res.status(401).json({ error: 'Wrong credentials.' });
    }

    const { id, name } = user;

    return res.json({
        user: { id, name, email },
        token: jwt.sign({ id, name, email }, process.env.APP_SECRET, { expiresIn: '7d' })
    })
}

module.exports = { create }