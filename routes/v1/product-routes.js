const express = require('express');
const ProductController = require('../../controller/product-controller');
const upload = require('../../config/multer-config');
const router = express.Router();

// Create a new product (with image upload support)
router.post('/create', upload.array('images', 5), ProductController.createProduct);

// Get products (supports query filters: ?category=...&price=min-max)
router.get('/', ProductController.getProducts);

// Get product detail page (view route)
router.get('/detail/:id', ProductController.getProductDetailPage);

// Update a product by id
router.put('/:id', ProductController.updateProduct);

// Delete a product by id
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
