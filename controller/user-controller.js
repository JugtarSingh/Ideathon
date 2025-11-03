const { UserService } = require('../service');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse , ErrorResponse } = require('../utils/common')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { serverConfig } = require('../config');

function hashPassword(password){
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
}


async function createUser(req,res){
    try {
        // Validate required fields
        if (!req.body.name || !req.body.email || !req.body.password) {
            ErrorResponse.error = {
                message: 'Name, email, and password are required fields',
                statusCode: StatusCodes.BAD_REQUEST
            };
            ErrorResponse.message = 'Missing required fields';
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }

        // Validate location structure
        if (!req.body.location || !req.body.location.coordinates || !Array.isArray(req.body.location.coordinates)) {
            // Set default location if not provided
            req.body.location = {
                type: "Point",
                coordinates: [0, 0], // Default coordinates
                addressDetails: req.body.location?.addressDetails || {}
            };
        }

        // Validate and set default type
        const userType = req.body.type === 'seller' ? 'seller' : 'user';

        const userData = {
            name: req.body.name.trim(),
            email: req.body.email.trim().toLowerCase(),
            password: hashPassword(req.body.password),
            type: userType,
            location: {
                type: "Point",
                coordinates: req.body.location.coordinates || [0, 0],
                addressDetails: req.body.location.addressDetails || {}
            }
        };

        const user = await UserService.createUser(userData);
        
        // Remove password from response
        const userObject = user.toObject();
        delete userObject.password;

        // Generate JWT token for the new user
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                type: user.type
            },
            serverConfig.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set httpOnly cookie for server-rendered pages
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        SuccessResponse.data = {
            user: userObject,
            token: token
        };
        SuccessResponse.message = "User created successfully";
        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse);
    } catch (error) {
        console.error('Create user error:', error);
        
        // Handle MongoDB duplicate key error (unique email)
        if (error.name === 'MongoServerError' && error.code === 11000) {
            ErrorResponse.error = {
                message: 'Email already exists. Please use a different email.',
                statusCode: StatusCodes.BAD_REQUEST
            };
            ErrorResponse.message = 'Email already exists';
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            ErrorResponse.error = {
                message: error.message,
                statusCode: StatusCodes.BAD_REQUEST
            };
            ErrorResponse.message = error.message;
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
        }

        // Handle AppError with proper message
        if (error.statusCode) {
            ErrorResponse.error = {
                message: error.message || 'Failed to create user',
                statusCode: error.statusCode
            };
            ErrorResponse.message = error.message || 'Failed to create user';
            return res
            .status(error.statusCode)
            .json(ErrorResponse);
        }

        // Generic error
        ErrorResponse.error = {
            message: error.message || 'Failed to create user. Please check your input and try again.',
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR
        };
        ErrorResponse.message = error.message || 'Failed to create user';
        return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse);
    }
}

async function getUser(req,res){
    try {
         
    } catch (error) {
        
    }
}

async function loginformRender(req, res){
    // Check if request wants JSON response (for AJAX)
    if (req.query.render === 'true' || req.headers.accept?.includes('application/json')) {
        // Return login form HTML
        return res.render('login', {});
    }
    // Otherwise render full page
    res.render('login', {});
}

async function dashboardRender(req, res) {
    try {
        // Get token from query or header
        const token = req.query.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.redirect('/api/v1/user/login');
        }

        // Verify token and get user
        const jwt = require('jsonwebtoken');
        const { serverConfig } = require('../config');
        const decoded = jwt.verify(token, serverConfig.JWT_SECRET);
        const user = await UserService.getUser({ _id: decoded.id });
        
        if (!user) {
            return res.redirect('/api/v1/user/login');
        }

        // Populate user cart
        await user.populate('cart');
        const cartCount = user.cart ? user.cart.length : 0;

        // Check if user is seller (retailer) or regular user
        if (user.type === 'seller') {
            // Render retailer dashboard
            const { ProductService } = require('../service');
            const { OrderService } = require('../service');
            
            const products = await ProductService.getProducts({});
            const sellerProducts = products.filter(p => {
                if (!p.userId) return false;
                const ownerId = p.userId._id ? p.userId._id.toString() : p.userId.toString();
                return ownerId === user._id.toString();
            });
            
            const orders = await OrderService.getOrdersBySeller(user._id);
            
            return res.render('retailer-dashboard', {
                user: user,
                products: sellerProducts,
                orders: orders,
                cartCount: cartCount,
                message: req.query.message || null
            });
        } else {
            // Render user dashboard
            const { OrderService } = require('../service');
            const orders = await OrderService.getOrdersByUser(user._id);
            
            return res.render('user-dashboard', {
                user: user,
                cart: user.cart || [],
                orders: orders,
                cartCount: cartCount,
                message: req.query.message || null
            });
        }
    } catch (error) {
        console.error('Dashboard render error:', error);
        return res.redirect('/api/v1/user/login');
    }
}

async function sellerInfoRender(req, res) {
    try {
        const token = req.query.token || req.headers.authorization?.split(' ')[1] || req.cookies?.token;
        if (!token) return res.redirect('/api/v1/user/login');
        const decoded = jwt.verify(token, serverConfig.JWT_SECRET);
        const user = await UserService.getUser({ _id: decoded.id });
        if (!user || user.type !== 'seller') return res.redirect('/');

        return res.render('seller-info', {
            user,
            cartCount: Array.isArray(user.cart) ? user.cart.length : 0
        });
    } catch (e) {
        return res.redirect('/api/v1/user/login');
    }
}

async function login(req, res) {
    try {
            const { email, password } = req.body;
            if(!email || !password) {
                throw new AppError('Email and password are required', StatusCodes.BAD_REQUEST);
            }
            const user = await UserService.getUser({ email });
            if(!user) {
                throw new AppError('User not found with given email', StatusCodes.NOT_FOUND);
            }
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if(!passwordMatch) {
                throw new AppError('Invalid password', StatusCodes.UNAUTHORIZED);
            }
            const userObject = user.toObject();
            delete userObject.password;
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user._id, 
                    email: user.email,
                    type: user.type
                },
                serverConfig.JWT_SECRET,
                { expiresIn: '7d' }
            );
        
            // Set httpOnly cookie for server-rendered pages
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            SuccessResponse.data = {
                user: userObject,
                token: token
            };
            SuccessResponse.message = "Login successful! Welcome back, " + userObject.name;
            return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch (error) {
            ErrorResponse.error = error;
            ErrorResponse.message = error.message || "Login failed";
            return res
                .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('token');
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to logout'
        });
    }
}

module.exports = {
    createUser,
    login,
    loginformRender,
    dashboardRender,
    sellerInfoRender,
    logout
}