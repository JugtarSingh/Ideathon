const express = require('express');
const CartController = require('../../controller/cart-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.post('/add', CartController.addToCart);
router.delete('/remove/:productId', CartController.removeFromCart);
router.get('/', CartController.getCart);
router.delete('/clear', CartController.clearCart);

module.exports = router;

