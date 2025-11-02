const express = require('express');
const ProductController = require('../../controller/product-controller');
const router = express.Router();

// Create a new product
router.post('/create', ProductController.createProduct);

// Get products (supports query filters: ?category=...&price=min-max)
router.get('/', ProductController.getProducts);

// Update a product by id
router.put('/:id', ProductController.updateProduct);

// Delete a product by id
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
