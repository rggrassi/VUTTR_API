const User = require('../models/User');
const Yup = require('yup');

const create = async(req, res) => {
    const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required().min(6)
    })
    if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails.' })
    }
    
    const userExists = await User.findOne({ email: req.body.email })
    if (userExists) {
        return res.status(400).json({ error: 'User not available.' })
    }

    const user = await User.create(req.body);        

    return res.status(201).json(user);
}

const update = async (req, res) => {
    const schema = Yup.object().shape({
        name: Yup.string(),
        email: Yup.string().email(),
        oldPassword: Yup.string().min(6),
        password: Yup.string().min(6)
            .when('oldPassword', (oldPassword, field) =>
                oldPassword ? field.required() : field 
            ),
        confirmPassword: Yup.string()
            .when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            )    
    })

    if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validations fails.' })
    }

    const user = await User.findById(req.user.id);

    if (req.body.email && req.body.email !== user.email) {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(400).json({ error: 'User not available.' });
        }
    }

    if (req.body.oldPassword && !(await user.checkPassword(req.body.oldPassword))) {
        return res.status(401).json({ error: 'Wrong credentials.' })
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    const updatedUser = await user.save();
    return res.json(updatedUser);
}

module.exports = { create, update }