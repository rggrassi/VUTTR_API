const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: 'Token not provided' })
    }
    const [bearer, token] = authorization.split(' ');
    try {
        const { id, name, email, role } = jwt.verify(token, process.env.APP_SECRET);        
        req.user = { id, name, email, role };
        return next();
    } catch (error) {
        res.status(401).json({ error: 'Token not valid' })
    }
}