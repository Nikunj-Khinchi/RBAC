const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const WriteResponse = require('../utils/response');
const logger = require('../utils/logger');


const registerValidation = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    role: joi.string().valid('Admin', 'Moderator', 'User').default('User').messages({ 'any.only': 'Invalid role' }),
    password: joi.string().min(6).required(),
    confirmPassword: joi.string().min(6).required().valid(joi.ref('password')).messages({ 'any.only': 'Passwords do not match' })
});

const register = async (req, res) => {
    const errors = registerValidation.validate(req.body).error;

    if (errors) {
        return WriteResponse(res, 400, errors.details[0].message);
    }
    const { name, email, password, role } = req.body;
    try {
        let user = await User.findOne({ 
            email, 
            isDeleted: false
        });

        if (user) {
            return WriteResponse(res, 400, 'User already exists');
        }

        user = new User({ name, email, password, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // const payload = { user: { id: user.id, role: user.role } };
        // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

        logger.info(`User registered: ${user.email}`);
        return WriteResponse(res, 200, 'User registered successfully', user);

    } catch (error) {
        logger.error(`Register error: ${error.message}`);
        return WriteResponse(res, 500, 'Server error');
    }
}

const loginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

const login = async (req, res) => {
    const errors = loginValidation.validate(req.body).error;

    if (errors) {
        return WriteResponse(res, 400, errors.details[0].message);
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            return WriteResponse(res, 400, 'Invalid credentials');
        }

        if(user.isDeleted){
            return WriteResponse(res, 400, 'Account not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return WriteResponse(res, 400, 'Invalid credentials');
        }

        const payload = { user };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

        logger.info(`User logged in: ${user.email}`);
        return WriteResponse(res, 200, 'User logged in successfully', { user, token });

    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        return WriteResponse(res, 500, 'Server error');
    }
}

const forgotPassword = async(req, res) => {
    const { email, password } = req.body;
    try{

        let user = await User.findOne({ email });
        if (!user) {
            return WriteResponse(res, 400, 'User not found');
        }
        // update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        logger.info(`Forget Password: ${user.email}`);
        return WriteResponse(res, 200, 'Password updated successfully', user);
        
    }catch(error){
        logger.error(`Forget Password error: ${error.message}`);
        return WriteResponse(res, 500, 'Server error');
    }
}

const deleteAccount = async(req, res) => {
    const email = req.body.email;
    try{
        let user = await User.findOne({ email });
        if (!user) {
            return WriteResponse(res, 400, 'User not found');
        }
        if(user.isDeleted){
            return WriteResponse(res, 400, 'User already deleted');
        }
        // delete account
        user.isDeleted = true;
        await user.save();
        logger.info(`Account deleted: ${user.email}`);
        return WriteResponse(res, 200, 'Account deleted successfully', user);

    }catch(error){
        logger.error(`Delete Account error: ${error.message}`);
        return WriteResponse(res, 500, 'Server error');
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { role } = req.body;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({ role }).skip(skip).limit(limit);
        const totalUsers = await User.countDocuments();

        const pagination = {
            totalUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            hasNextPage: page * limit < totalUsers,
            hasPrevPage: page > 1
        };

        return WriteResponse(res, 200, 'Users retrieved successfully', { users, pagination });
    } catch (error) {
        logger.error(`Get All Users error: ${error.message}`);
        return WriteResponse(res, 500, 'Server error');
    }
};

module.exports = {
    getAllUsers,
    register,
    login,
    forgotPassword,
    deleteAccount
};

