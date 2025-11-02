const { UserRepository} = require("../repository");
const AppError = require("../utils/error/AppError");
const { StatusCodes } = require("http-status-codes");

const userRepository = new UserRepository();

async function createUser(data){
    try {
        // Validate required fields
        if (!data.name || !data.email || !data.password) {
            throw new AppError('Name, email, and password are required', StatusCodes.BAD_REQUEST);
        }

        // Validate location structure - set default if not provided
        if (!data.location || !data.location.coordinates || !Array.isArray(data.location.coordinates)) {
            // Set default location instead of throwing error
            data.location = {
                type: "Point",
                coordinates: [0, 0],
                addressDetails: data.location?.addressDetails || {}
            };
        }

        // Check if database is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            throw new AppError('Database connection not available. Please try again later.', StatusCodes.SERVICE_UNAVAILABLE);
        }

        const user = await userRepository.create(data);
        return user; 
    } catch (error) {
        // Re-throw AppError as-is
        if (error instanceof AppError) {
            throw error;
        }
        // Log the actual error for debugging
        console.error('Error creating user:', error);
        throw new AppError(`Cannot create user: ${error.message || 'Unknown error'}`, StatusCodes.INTERNAL_SERVER_ERROR);
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