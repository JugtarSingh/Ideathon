const express = require('express');
const infoController = require('../../controller/info-controller')
const router = express.Router();
const  UserRoutes  = require('./user-routes');
const  ProductRoutes  = require('./product-routes');

router.use('/user', UserRoutes);
router.use('/product', ProductRoutes);

router.get('/info',infoController.info);

module.exports = router;

