const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');
class CrudRepository {
    constructor(model){
        this.model = model;
    }
    async create(data){
        try {
            // Check if mongoose is connected
            if (this.model.db.readyState !== 1) {
                console.log('Database not connected');
                throw new AppError("Database connection not available", StatusCodes.SERVICE_UNAVAILABLE);
            }

            console.log("Data in crud repo" , data);
            const response = await this.model.create(data);
            return response;
        } catch (error) {
            console.error('Repository create error:', error);
            // Re-throw AppError as-is
            if (error instanceof AppError) {
                throw error;
            }
            // Re-throw MongoDB/Mongoose errors with their original messages
            if (error.name === 'MongoServerError' || error.name === 'ValidationError') {
                throw error;
            }
            throw new AppError(`Error in creating the resource: ${error.message || 'Unknown error'}`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    async getAll(){
        try {
            const response = await this.model.find();
            return response;
        } catch (error) {
            throw new AppError("Error in fetching all resources", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    async get(data){
        try {
            // Check if mongoose is connected
            if (this.model.db.readyState !== 1) {
                console.log('Database not connected, returning null');
                return null;
            }
            
            const response = await this.model.findOne(data);
            return response;
        } catch (error) {
            console.error('Error in repository get:', error.message);
            // Return null instead of throwing to prevent hanging
            return null;
        }
    }

    async update(id , data){
        try {
            const response = await this.model.findByIdAndUpdate(id , data , {new : true});
            return response;
        } catch (error) {
            throw new AppError("Error in updating the resource", StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(id){
        try {
            const response = await this.model.findByIdAndDelete(id);
            return response;
        } catch (error) {
            throw new AppError("Error in deleting the resource", StatusCodes.INTERNAL_SERVER_ERROR); 
        }
    }

}

module.exports = CrudRepository;