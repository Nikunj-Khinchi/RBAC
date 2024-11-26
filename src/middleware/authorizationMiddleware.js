const jwt = require('jsonwebtoken');
const WriteResponse = require('../utils/response');

const authorization = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return WriteResponse(res, 401, 'Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        return WriteResponse(res, 400, 'Invalid token.');
    }
};

module.exports = authorization;
