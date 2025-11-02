const { ProductService } = require('../service');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function createProduct(req, res) {
    try {
        // Expect product fields in req.body, including userId
        const product = await ProductService.createProduct(req.body);
        const response = {
            ...SuccessResponse,
            data: product,
            message: 'Product created successfully'
        };
        return res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        const status = error && error.statusCode ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
        const errRes = {
            ...ErrorResponse,
            message: error.message || ErrorResponse.message,
            error: error
        };
        return res.status(status).json(errRes);
    }
}

async function getProducts(req, res) {
    try {
        // Support filters via query string: ?category=...&price=min-max
        const filters = {
            category: req.query.category,
            price: req.query.price
        };
        const products = await ProductService.getProducts(filters);
        const response = {
            ...SuccessResponse,
            data: products,
            message: 'Products fetched successfully'
        };
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        
        const status = error && error.statusCode ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
        const errRes = {
            ...ErrorResponse,
            message: error.message || ErrorResponse.message,
            error: error
        };
        return res.status(status).json(errRes);
    }
}

async function updateProduct(req, res) {
    try {
        const productId = req.params.id;
        if (!productId) throw new AppError('Product id is required', StatusCodes.BAD_REQUEST);
        const product = await ProductService.updateProduct(productId, req.body);
        const response = {
            ...SuccessResponse,
            data: product,
            message: 'Product updated successfully'
        };
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        const status = error && error.statusCode ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
        const errRes = {
            ...ErrorResponse,
            message: error.message || ErrorResponse.message,
            error: error
        };
        return res.status(status).json(errRes);
    }
}

async function deleteProduct(req, res) {
    try {
        const productId = req.params.id;
        if (!productId) throw new AppError('Product id is required', StatusCodes.BAD_REQUEST);
        const responseData = await ProductService.deleteProduct(productId);
        const response = {
            ...SuccessResponse,
            data: responseData,
            message: 'Product deleted successfully'
        };
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        const status = error && error.statusCode ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
        const errRes = {
            ...ErrorResponse,
            message: error.message || ErrorResponse.message,
            error: error
        };
        return res.status(status).json(errRes);
    }
}

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
};
