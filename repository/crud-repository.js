const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');
class CrudRepository {
    constructor(model){
        this.model = model;
    }
    async create(data){
        try {
            console.log("Data in crud repo" , data);
            const response = await this.model.create(data);
            return response;
        } catch (error) {
            console.log(error);
            throw new AppError("Error in creating the resource", StatusCodes.INTERNAL_SERVER_ERROR);
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
            const response = await this.model.findOne(data);
            return response;
        } catch (error) {
            throw new AppError("Error in fetching the resource", StatusCodes.INTERNAL_SERVER_ERROR);
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


}

module.exports = CrudRepository;