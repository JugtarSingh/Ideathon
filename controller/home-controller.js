const { ProductService } = require('../service');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/error/AppError');

async function getHomePage(req, res) {
    try {
        // Get latest products for the landing page with timeout protection
        const productsPromise = ProductService.getProducts({});
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve([]), 5000); // 5 second timeout
        });
        
        const products = await Promise.race([productsPromise, timeoutPromise]);
        
        // Ensure products is an array
        const productsArray = Array.isArray(products) ? products : [];
        
        // Show newest 12 products
        const displayProducts = productsArray.slice(0, 12);

        const user = req.user || null;
        let cartCount = 0;
        if (user && user.cart) {
            cartCount = Array.isArray(user.cart) ? user.cart.length : 0;
        }

        // Ensure displayProducts is properly formatted
        const safeProducts = displayProducts.map(p => ({
            _id: p._id || p.id,
            name: p.name || 'Unnamed Product',
            description: p.description || '',
            price: typeof p.price === 'number' ? p.price : 0,
            image: Array.isArray(p.image) ? p.image : (p.image ? [p.image] : []),
            bestseller: p.bestseller || false
        }));

        return res.render('home', {
            products: safeProducts,
            user: user,
            cartCount: cartCount,
            message: req.query.message || null
        });
    } catch (error) {
        console.error('Error fetching home page:', error);
        // Always render the page, even on error
        return res.render('home', {
            products: [],
            user: req.user || null,
            cartCount: 0,
            message: null
        });
    }
}

async function getBestsellers(req, res) {
    try {
        const products = await ProductService.getProducts({});
        const bestsellers = products.filter(p => p.bestseller).slice(0, 12);

        const user = req.user || null;
        let cartCount = 0;
        if (user) {
            cartCount = user.cart ? user.cart.length : 0;
        }

        return res.render('bestsellers', {
            products: bestsellers,
            user: user,
            cartCount: cartCount
        });
    } catch (error) {
        console.error('Error fetching bestsellers:', error);
        return res.render('bestsellers', {
            products: [],
            user: null,
            cartCount: 0
        });
    }
}

async function getCategories(req, res) {
    try {
        const category = req.query.category || null;
        const filters = category ? { category } : {};
        const products = await ProductService.getProducts(filters);

        const user = req.user || null;
        let cartCount = 0;
        if (user) {
            cartCount = user.cart ? user.cart.length : 0;
        }

        return res.render('categories', {
            products: products,
            selectedCategory: category,
            user: user,
            cartCount: cartCount
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.render('categories', {
            products: [],
            selectedCategory: null,
            user: null,
            cartCount: 0
        });
    }
}

async function getCart(req, res) {
    try {
        const user = req.user || null;
        
        if (!user) {
            return res.render('cart', {
                user: null,
                cart: [],
                cartCount: 0
            });
        }

        // Populate user cart
        await user.populate('cart');
        const cart = user.cart || [];

        return res.render('cart', {
            user: user,
            cart: cart,
            cartCount: cart.length
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        return res.render('cart', {
            user: null,
            cart: [],
            cartCount: 0
        });
    }
}

async function getCheckout(req, res) {
    try {
        const user = req.user || null;
        if (!user) {
            return res.redirect('/api/v1/user/login');
        }
        await user.populate('cart');
        const cart = user.cart || [];
        return res.render('checkout', {
            user,
            cart,
            cartCount: cart.length
        });
    } catch (error) {
        console.error('Error rendering checkout:', error);
        return res.redirect('/cart');
    }
}

module.exports = {
    getHomePage,
    getBestsellers,
    getCategories,
    getCart,
    getCheckout
};

