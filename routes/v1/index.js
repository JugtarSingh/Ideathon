const express = require('express');
const infoController = require('../../controller/info-controller')
const router = express.Router();
const  UserRoutes  = require('./user-routes');

router.use('/user', UserRoutes);

router.get('/info',infoController.info);



module.exports = router;

