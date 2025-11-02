const jwt = require('jsonwebtoken');
const { serverConfig } = require('../config');
const { UserRepository } = require('../repository');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');

const userRepository = new UserRepository();

async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.query.token || req.cookies?.token;
        
        if (!token) {
            // Check if token exists in localStorage (from client side)
            // For server-side rendering, we'll use a different approach
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Token not found. Please login.',
                error: {
                    message: 'Authentication required'
                }
            });
        }

        const decoded = jwt.verify(token, serverConfig.JWT_SECRET);
        const user = await userRepository.get({ _id: decoded.id });

        if (!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid or expired token',
                error: {
                    message: 'Authentication failed'
                }
            });
        }
        next(error);
    }
}

// Middleware to attach user info from token stored in request body or query (for EJS views)
async function attachUserFromToken(req, res, next) {
    try {
        const token = req.query.token || req.body.token || req.cookies?.token || 
                     req.headers.authorization?.split(' ')[1];
        
        if (token) {
            try {
                const decoded = jwt.verify(token, serverConfig.JWT_SECRET);
                
                // Add timeout protection for database query
                const getUserPromise = userRepository.get({ _id: decoded.id });
                const timeoutPromise = new Promise((resolve) => {
                    setTimeout(() => resolve(null), 3000); // 3 second timeout
                });
                
                const user = await Promise.race([getUserPromise, timeoutPromise]);
                
                if (user) {
                    try {
                        // Populate cart with timeout protection
                        const populatePromise = user.populate('cart');
                        const populateTimeout = new Promise((resolve) => {
                            setTimeout(() => resolve(), 2000); // 2 second timeout
                        });
                        
                        await Promise.race([populatePromise, populateTimeout]);
                        req.user = user;
                    } catch (populateError) {
                        // If populate fails, still attach user without populated cart
                        console.log('Error populating cart:', populateError.message);
                        req.user = user;
                    }
                }
            } catch (error) {
                // Token invalid or expired, continue without user
                if (error.name !== 'TokenExpiredError' && error.name !== 'JsonWebTokenError') {
                    console.log('Token verification failed:', error.message);
                }
            }
        }
        // Always call next, even if there's an error
        next();
    } catch (error) {
        // Continue without user on any error - don't block the request
        console.log('Error in attachUserFromToken:', error.message);
        next();
    }
}

module.exports = {
    authenticate,
    attachUserFromToken
};

