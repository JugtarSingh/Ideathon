const { CartService } = require('../service');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function addToCart(req, res) {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                ...ErrorResponse,
                message: 'Product ID is required'
            });
        }

        const cart = await CartService.addToCart(req.user._id, productId);
        
        return res.status(StatusCodes.OK).json({
            ...SuccessResponse,
            data: cart,
            message: 'Product added to cart successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to add product to cart',
            error: error
        });
    }
}

async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                ...ErrorResponse,
                message: 'Product ID is required'
            });
        }

        const cart = await CartService.removeFromCart(req.user._id, productId);
        
        return res.status(StatusCodes.OK).json({
            ...SuccessResponse,
            data: cart,
            message: 'Product removed from cart successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to remove product from cart',
            error: error
        });
    }
}

async function getCart(req, res) {
    try {
        const cart = await CartService.getCart(req.user._id);
        
        return res.status(StatusCodes.OK).json({
            ...SuccessResponse,
            data: cart,
            message: 'Cart fetched successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to fetch cart',
            error: error
        });
    }
}

async function clearCart(req, res) {
    try {
        const cart = await CartService.clearCart(req.user._id);
        
        return res.status(StatusCodes.OK).json({
            ...SuccessResponse,
            data: cart,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to clear cart',
            error: error
        });
    }
}

module.exports = {
    addToCart,
    removeFromCart,
    getCart,
    clearCart
};

