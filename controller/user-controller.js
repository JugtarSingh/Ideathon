const { UserService } = require('../service');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse , ErrorResponse } = require('../utils/common')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { serverConfig } = require('../config');

function hashPassword(password){
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
}


async function createUser(req,res){
    try {
        const user = await UserService.createUser({
            name : req.body.name,
            email : req.body.email,
            password : hashPassword(req.body.password),
            type : req.body.type,
            location : {
                type: "Point",
                coordinates: req.body.location.coordinates,
                addressDetails: req.body.location.addressDetails
            }
        })
        SuccessResponse.data = user;
        SuccessResponse.message = "User created successfully";
        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse);
    } catch (error) {
        // Handle MongoDB duplicate key error (unique email)
        if (error.name === 'MongoServerError' && error.code === 11000) {
            ErrorResponse.error = {
                message: 'Email already exists. Please use a different email.',
                statusCode: StatusCodes.BAD_REQUEST
            };
            ErrorResponse.message = 'Email already exists';
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }
        // Handle validation errors
        if (error.name === 'ValidationError') {
            ErrorResponse.error = {
                message: error.message,
                statusCode: StatusCodes.BAD_REQUEST
            };
            ErrorResponse.message = error.message;
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }
        ErrorResponse.error = error;
        ErrorResponse.message = error.message || "Failed to create user";
        return res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }
}

async function getUser(req,res){
    try {
         
    } catch (error) {
        
    }
}

async function loginformRender(req,res){
    res
    .render('../public/views/login.ejs');
}

async function dashboardRender(req, res) {
    // Render the dashboard view. Accept an optional message via query string (e.g. ?message=Welcome)
    const message = req.query && req.query.message ? req.query.message : null;
    // If you later add sessions, you can pass the logged-in user here.
    return res.render('dashboard', { message, user: null });
}

async function login(req, res) {
    try {
            const { email, password } = req.body;
            if(!email || !password) {
                throw new AppError('Email and password are required', StatusCodes.BAD_REQUEST);
            }
            const user = await UserService.getUser({ email });
            if(!user) {
                throw new AppError('User not found with given email', StatusCodes.NOT_FOUND);
            }
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if(!passwordMatch) {
                throw new AppError('Invalid password', StatusCodes.UNAUTHORIZED);
            }
            const userObject = user.toObject();
            delete userObject.password;
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user._id, 
                    email: user.email,
                    type: user.type
                },
                serverConfig.JWT_SECRET,
                { expiresIn: '7d' }
            );
        
            SuccessResponse.data = {
                user: userObject,
                token: token
            };
            SuccessResponse.message = "Login successful! Welcome back, " + userObject.name;
            return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
            ErrorResponse.error = error;
            ErrorResponse.message = error.message || "Login failed";
            return res
                .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

module.exports = {
    createUser,
    login,
    loginformRender,
    dashboardRender
}