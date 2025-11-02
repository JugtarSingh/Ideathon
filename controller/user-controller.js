const { UserService } = require('../service');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse , ErrorResponse } = require('../utils/common')
const bcrypt = require('bcrypt');

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
        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
        .status(error.statusCode)
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
        
            SuccessResponse.data = userObject;
            SuccessResponse.message = "Login successful! Welcome back, " + userObject.name;
            return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
            ErrorResponse.error = error;
            ErrorResponse.message = error.message || "Login failed";
            return res
                .status(error.statusCode)
                .json(ErrorResponse);
    }
}

module.exports = {
    createUser,
    login,
    loginformRender
}