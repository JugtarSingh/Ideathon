const express = require('express');
const OrderController = require('../../controller/order-controller');
const { authenticate } = require('../../middleware/auth-middleware');
const router = express.Router();

// All order routes require authentication
router.use(authenticate);

router.post('/create', OrderController.createOrder);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/seller-orders', OrderController.getSellerOrders);
router.put('/update-status/:orderId', OrderController.updateOrderStatus);

module.exports = router;

