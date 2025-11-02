const { UserRepository } = require('../repository');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');

const userRepository = new UserRepository();

async function addToCart(userId, productId) {
    try {
        const user = await userRepository.get({ _id: userId });
        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        // Check if product already in cart
        if (user.cart && user.cart.includes(productId)) {
            throw new AppError('Product already in cart', StatusCodes.BAD_REQUEST);
        }

        // Add product to cart
        if (!user.cart) {
            user.cart = [];
        }
        user.cart.push(productId);
        
        await user.save();
        
        // Populate cart products
        await user.populate('cart');
        
        return user.cart;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Unable to add product to cart', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function removeFromCart(userId, productId) {
    try {
        const user = await userRepository.get({ _id: userId });
        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        if (!user.cart || !user.cart.includes(productId)) {
            throw new AppError('Product not in cart', StatusCodes.BAD_REQUEST);
        }

        user.cart = user.cart.filter(id => id.toString() !== productId.toString());
        await user.save();
        
        await user.populate('cart');
        
        return user.cart;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Unable to remove product from cart', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getCart(userId) {
    try {
        const user = await userRepository.get({ _id: userId });
        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        await user.populate('cart');
        
        return user.cart || [];
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Unable to fetch cart', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function clearCart(userId) {
    try {
        const user = await userRepository.get({ _id: userId });
        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        user.cart = [];
        await user.save();
        
        return [];
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Unable to clear cart', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    addToCart,
    removeFromCart,
    getCart,
    clearCart
};

