const { ProductService } = require('../service');
const AppError = require('../utils/error/AppError');
const { StatusCodes } = require('http-status-codes');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Helper function to upload image to Cloudinary
function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'ecommerce-products',
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
    });
}

async function createProduct(req, res) {
    try {
        // Handle file uploads
        let imageUrls = [];
        
        if (req.files && req.files.length > 0) {
            // Upload all images to Cloudinary
            const uploadPromises = req.files.map(file => uploadToCloudinary(file));
            imageUrls = await Promise.all(uploadPromises);
        } else if (req.files && (req.files.images || req.files.image)) {
            // Handle single file or multiple files in 'images' field
            const files = req.files.images 
                ? (Array.isArray(req.files.images) ? req.files.images : [req.files.images])
                : (Array.isArray(req.files.image) ? req.files.image : [req.files.image]);
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            imageUrls = await Promise.all(uploadPromises);
        }

        // Prepare product data
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            image: imageUrls.length > 0 ? imageUrls : [],
            bestseller: req.body.bestseller === 'true' || req.body.bestseller === true,
            userId: req.body.userId || req.user?._id
        };

        if (!productData.userId) {
            throw new AppError('User ID is required', StatusCodes.BAD_REQUEST);
        }

        const product = await ProductService.createProduct(productData);
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

async function getProductDetailPage(req, res) {
    try {
        const productId = req.params.id;
        const { Product } = require('../models');
        const product = await Product.findById(productId)
            .populate('userId', 'name email');

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).send('Product not found');
        }

        const user = req.user || null;
        let cartCount = 0;
        if (user) {
            cartCount = user.cart ? user.cart.length : 0;
        }

        return res.render('product-detail', {
            product: product,
            user: user,
            cartCount: cartCount
        });
    } catch (error) {
        console.error('Error fetching product detail:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error loading product details');
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductDetailPage,
    updateProduct,
    deleteProduct
};
