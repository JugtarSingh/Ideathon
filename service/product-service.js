const { StatusCodes } = require("http-status-codes");
const { ProductRepository } = require("../repository");
const AppError = require("../utils/error/AppError");

const productRepository = new ProductRepository();

async function createProduct(data){
    try {
        let product = await productRepository.create(data);
        product = await product.populate('userId', 'name email');
        return product;
    } catch (error) {
        console.log(error);
        throw new AppError('Unable to create a product ', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getProducts(data){
    try {
        let products = await productRepository.getProduct(data);
        
        // Handle case where products array might be empty or null
        if (!products || !Array.isArray(products)) {
            return [];
        }

        // Safely populate userId, handling cases where userId might be null or invalid
        products = await Promise.all(products.map(async (product) => {
            try {
                if (product.userId) {
                    await product.populate('userId', 'name email');
                }
                return product;
            } catch (populateError) {
                // If populate fails, return product without populated userId
                console.log('Error populating userId for product:', product._id, populateError.message);
                return product;
            }
        }));
        
        return products;
    } catch (error) {
        console.error('Error in getProducts:', error);
        // Return empty array instead of throwing error to prevent infinite loading
        return [];
    }
}

async function updateProduct(id,data){
    try {
        let product = await productRepository.update(id,data);
        product = await product.populate('userId', 'name email');
        return product;
    } catch (error) {
        throw new AppError('Unable to update the product', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function deleteProduct(id){
    try {
        let response = await productRepository.delete(id);
        return response;
    } catch (error) {
        throw new AppError('Unable to delete the product', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
}


