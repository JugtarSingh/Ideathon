const express = require('express');
const ProductController = require('../../controller/product-controller');
const upload = require('../../config/multer-config');
const { authenticate, requireSeller } = require('../../middleware/auth-middleware');
const router = express.Router();

// Create a new product (with image upload support)
router.post(
    '/create',
    authenticate,
    requireSeller,
    (req, res, next) => {
        // Wrap multer to gracefully handle errors and continue without files
        upload.array('images', 5)(req, res, (err) => {
            if (err) {
                req.multerError = err;
                req.files = [];
            }
            next();
        });
    },
    ProductController.createProduct
);

// Get products (supports query filters: ?category=...&price=min-max)
router.get('/', ProductController.getProducts);

// Get product detail page (view route)
router.get('/detail/:id', ProductController.getProductDetailPage);

// Update a product by id
router.put('/:id', authenticate, requireSeller, ProductController.updateProduct);

// Delete a product by id
router.delete('/:id', authenticate, requireSeller, ProductController.deleteProduct);

module.exports = router;
