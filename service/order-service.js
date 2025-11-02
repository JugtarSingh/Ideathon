const { Order } = require('../models');
const { UserRepository, ProductRepository } = require('../repository');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');

const userRepository = new UserRepository();
const productRepository = new ProductRepository();

async function createOrder(userId, productIds) {
    try {
        const user = await userRepository.get({ _id: userId });
        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        if (!productIds || productIds.length === 0) {
            throw new AppError('Products are required', StatusCodes.BAD_REQUEST);
        }

        // Get products with prices
        const products = [];
        let totalAmount = 0;

        for (const productId of productIds) {
            const product = await productRepository.get({ _id: productId });
            if (!product) {
                throw new AppError(`Product with ID ${productId} not found`, StatusCodes.NOT_FOUND);
            }
            products.push({
                productId: product._id,
                quantity: 1,
                price: product.price
            });
            totalAmount += product.price;
        }

        // Create order
        const order = await Order.create({
            userId: userId,
            products: products,
            totalAmount: totalAmount,
            status: 'pending'
        });

        // Clear cart
        user.cart = [];
        await user.save();

        // Populate order details
        await order.populate('userId', 'name email');
        await order.populate('products.productId');

        return order;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Unable to create order', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getOrdersByUser(userId) {
    try {
        const orders = await Order.find({ userId })
            .populate('userId', 'name email')
            .populate('products.productId')
            .sort({ createdAt: -1 });
        
        return orders;
    } catch (error) {
        throw new AppError('Unable to fetch orders', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getOrdersBySeller(sellerId) {
    try {
        // Get all products created by this seller
        const { Product } = require('../models');
        const sellerProducts = await Product.find({ userId: sellerId });
        const productIds = sellerProducts.map(p => p._id);

        // Find all orders containing these products
        const orders = await Order.find({
            'products.productId': { $in: productIds }
        })
        .populate('userId', 'name email')
        .populate('products.productId')
        .sort({ createdAt: -1 });

        return orders;
    } catch (error) {
        throw new AppError('Unable to fetch orders', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        )
        .populate('userId', 'name email')
        .populate('products.productId');

        if (!order) {
            throw new AppError('Order not found', StatusCodes.NOT_FOUND);
        }

        return order;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Unable to update order', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createOrder,
    getOrdersByUser,
    getOrdersBySeller,
    updateOrderStatus
};

