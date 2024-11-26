const WriteResponse = require("../utils/response");

const authentication = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return WriteResponse(res, 403, "Access denied. You do not have permission to perform this action.");
        }
        next();
    };
};

module.exports = authentication;
