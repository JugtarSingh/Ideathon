const { UserRepository} = require("../repository");
const AppError = require("../utils/error/AppError");
const { StatusCodes } = require("http-status-codes");

const userRepository = new UserRepository();

async function createUser(data){
    try {
        const user = await userRepository.create(data);
        return user; 
    } catch (error) {
        throw new AppError('Cannot create user', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getUser(data){
    try {
        const user = await userRepository.get(data);
        if(!user){
            throw new AppError('User not found' , StatusCodes.NOT_FOUND);
        }
        return user;
    } catch (error) {
        throw new AppError('Cannot retrieve user', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createUser,
    getUser
}