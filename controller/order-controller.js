const { OrderService } = require('../service');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

async function createOrder(req, res) {
    try {
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                ...ErrorResponse,
                message: 'Product IDs are required'
            });
        }

        const order = await OrderService.createOrder(req.user._id, productIds);
        
        return res.status(StatusCodes.CREATED).json({
            ...SuccessResponse,
            data: order,
            message: 'Order created successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to create order',
            error: error
        });
    }
}

async function getMyOrders(req, res) {
    try {
        const orders = await OrderService.getOrdersByUser(req.user._id);
        
        return res.status(StatusCodes.OK).json({
            ...SuccessResponse,
            data: orders,
            message: 'Orders fetched successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to fetch orders',
            error: error
        });
    }
}

async function getSellerOrders(req, res) {
    try {
        if (req.user.type !== 'seller') {
            return res.status(StatusCodes.FORBIDDEN).json({
                ...ErrorResponse,
                message: 'Only sellers can view seller orders'
            });
        }

        const orders = await OrderService.getOrdersBySeller(req.user._id);
        
        return res.status(StatusCodes.OK).json({
            ...SuccessResponse,
            data: orders,
            message: 'Orders fetched successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to fetch orders',
            error: error
        });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                ...ErrorResponse,
                message: 'Status is required'
            });
        }

        const order = await OrderService.updateOrderStatus(orderId, status);
        
        return res.status(StatusCodes.OK).json({
            ...SuccessResponse,
            data: order,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            ...ErrorResponse,
            message: error.message || 'Failed to update order status',
            error: error
        });
    }
}

module.exports = {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateOrderStatus
};

