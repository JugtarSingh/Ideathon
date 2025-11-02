const express = require('express');
const infoController = require('../../controller/info-controller')
const router = express.Router();
const  UserRoutes  = require('./user-routes');
const  ProductRoutes  = require('./product-routes');
const  CartRoutes  = require('./cart-routes');
const  OrderRoutes  = require('./order-routes');

router.use('/user', UserRoutes);
router.use('/product', ProductRoutes);
router.use('/cart', CartRoutes);
router.use('/order', OrderRoutes);

router.get('/info',infoController.info);

module.exports = router;

