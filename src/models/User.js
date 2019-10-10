const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

UserSchema.methods.toJSON = function() {
    const json = this.toObject();
    delete json.password;
    return json;
}

UserSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

UserSchema.pre('save', async function(next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(user.password, salt);
    user.password = passwordHash;

    next();
})

module.exports = mongoose.model('User', UserSchema);